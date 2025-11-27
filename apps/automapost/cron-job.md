# Async Job Processing & Cron Job Implementation Plan

## Overview
AutomaPost requires a robust job processing system to handle critical background tasks including:
- Daily email verification and member onboarding
- Social media post scheduling (every 1 minute check)
- Daily data processing for AI suggestions
- Analytics data aggregation
- Content optimization recommendations

All jobs must be tracked with comprehensive logging, execution times, and status monitoring stored in our PostgreSQL database.

**Infrastructure Constraints:**
- No Redis or additional queue infrastructure
- Ubuntu bare metal server with cron capability
- PM2 process manager already in use
- PostgreSQL as the primary database

---

## Plan 1: PM2 Ecosystem with Built-in Cron Support (Recommended)

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PM2 Cron     │ -> │   Job Workers    │ -> │   PostgreSQL    │
│   Scheduler     │    │   (Node.js)      │    │   Job Queue     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                v                        v
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Job Tracking  │    │   Logging       │
                       │   Database      │    │   System        │
                       └─────────────────┘    └─────────────────┘
```

### Implementation Details

#### 1. Database Schema (PostgreSQL as Queue)
```sql
-- Job definitions table
CREATE TABLE job_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cron_schedule VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  timeout_ms INTEGER DEFAULT 300000, -- 5 minutes
  concurrency_limit INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job queue table (PostgreSQL as queue)
CREATE TABLE job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 5,
  payload JSONB,
  scheduled_for TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'timeout'
  locked_at TIMESTAMP,
  locked_by VARCHAR(255),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job executions table for history
CREATE TABLE job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_definition_id UUID REFERENCES job_definitions(id),
  job_queue_id UUID REFERENCES job_queue(id),
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job logs table
CREATE TABLE job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_execution_id UUID REFERENCES job_executions(id),
  level VARCHAR(20) NOT NULL, -- 'info', 'warn', 'error', 'debug'
  message TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_job_queue_status_scheduled ON job_queue(status, scheduled_for);
CREATE INDEX idx_job_queue_locked ON job_queue(locked_by, locked_at);
CREATE INDEX idx_job_executions_status ON job_executions(status);
CREATE INDEX idx_job_logs_execution_id ON job_logs(job_execution_id);
```

#### 2. PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'automapost-app',
      script: 'yarn',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'job-worker',
      script: './workers/job-processor.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '*/1 * * * *', // Every minute
      autorestart: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'daily-jobs',
      script: './workers/daily-processor.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 8 * * *', // Daily at 8 AM
      autorestart: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'email-verification',
      script: './workers/email-processor.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 */6 * * *', // Every 6 hours
      autorestart: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

#### 3. PostgreSQL-based Queue Implementation
```typescript
// lib/jobs/pg-queue.ts
import { db } from '@/lib/db';

export class PostgresJobQueue {
  private workerId: string;
  private pollInterval: number = 5000; // 5 seconds

  constructor(workerId?: string) {
    this.workerId = workerId || `worker-${process.pid}-${Date.now()}`;
  }

  async enqueue(jobType: string, payload: any, options?: {
    priority?: number;
    scheduledFor?: Date;
    maxAttempts?: number;
  }) {
    return await db.jobQueue.create({
      data: {
        jobType,
        payload,
        priority: options?.priority || 5,
        scheduledFor: options?.scheduledFor || new Date(),
        maxAttempts: options?.maxAttempts || 3,
        status: 'pending'
      }
    });
  }

  async dequeue(jobTypes: string[], limit: number = 1): Promise<any[]> {
    // Use PostgreSQL advisory locks for concurrent worker safety
    const jobs = await db.$transaction(async (tx) => {
      // Lock jobs for processing
      const result = await tx.$queryRaw`
        UPDATE job_queue
        SET 
          status = 'running',
          locked_at = NOW(),
          locked_by = ${this.workerId},
          attempts = attempts + 1
        WHERE id IN (
          SELECT id
          FROM job_queue
          WHERE 
            status = 'pending'
            AND job_type = ANY(${jobTypes})
            AND scheduled_for <= NOW()
            AND attempts < max_attempts
            AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes')
          ORDER BY priority DESC, created_at ASC
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `;
      
      return result;
    });

    return jobs;
  }

  async complete(jobId: string, result?: any) {
    await db.jobQueue.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        lockedAt: null,
        lockedBy: null,
        updatedAt: new Date()
      }
    });
  }

  async fail(jobId: string, error: string) {
    const job = await db.jobQueue.findUnique({
      where: { id: jobId }
    });

    if (job && job.attempts >= job.maxAttempts) {
      await db.jobQueue.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errorMessage: error,
          lockedAt: null,
          lockedBy: null
        }
      });
    } else {
      // Release lock for retry
      await db.jobQueue.update({
        where: { id: jobId },
        data: {
          status: 'pending',
          errorMessage: error,
          lockedAt: null,
          lockedBy: null,
          scheduledFor: new Date(Date.now() + 60000) // Retry in 1 minute
        }
      });
    }
  }

  async cleanupStuckJobs() {
    // Reset jobs that have been locked for too long
    await db.$executeRaw`
      UPDATE job_queue
      SET 
        status = 'pending',
        locked_at = NULL,
        locked_by = NULL
      WHERE 
        status = 'running'
        AND locked_at < NOW() - INTERVAL '10 minutes'
    `;
  }
}
```

#### 4. Job Worker Implementation
```typescript
// workers/job-processor.ts
import { PostgresJobQueue } from '../lib/jobs/pg-queue';
import { JobLogger } from '../lib/jobs/logger';
import { db } from '../lib/db';

class JobProcessor {
  private queue: PostgresJobQueue;
  private isRunning: boolean = false;
  private jobHandlers: Map<string, Function> = new Map();

  constructor() {
    this.queue = new PostgresJobQueue();
    this.registerHandlers();
  }

  registerHandlers() {
    this.jobHandlers.set('social-media-post', this.processSocialMediaPost);
    this.jobHandlers.set('generate-suggestions', this.generateSuggestions);
    this.jobHandlers.set('send-email', this.sendEmail);
  }

  async start() {
    this.isRunning = true;
    console.log(`Job processor started: ${process.pid}`);

    // Process jobs every minute (triggered by PM2 cron)
    await this.processJobs();
    
    // Exit cleanly for PM2 to restart via cron
    process.exit(0);
  }

  async processJobs() {
    const jobTypes = Array.from(this.jobHandlers.keys());
    const jobs = await this.queue.dequeue(jobTypes, 10); // Process up to 10 jobs

    for (const job of jobs) {
      await this.executeJob(job);
    }
  }

  async executeJob(job: any) {
    const execution = await db.jobExecution.create({
      data: {
        jobQueueId: job.id,
        status: 'running',
        startedAt: new Date(),
        metadata: job.payload
      }
    });

    const logger = new JobLogger(execution.id);

    try {
      logger.info(`Starting job: ${job.jobType}`);
      
      const handler = this.jobHandlers.get(job.jobType);
      if (!handler) {
        throw new Error(`No handler for job type: ${job.jobType}`);
      }

      const result = await handler.call(this, job.payload, logger);
      
      await this.queue.complete(job.id, result);
      
      await db.jobExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
          durationMs: Date.now() - execution.startedAt.getTime()
        }
      });

      logger.info('Job completed successfully');
    } catch (error) {
      await this.queue.fail(job.id, error.message);
      
      await db.jobExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorMessage: error.message,
          durationMs: Date.now() - execution.startedAt.getTime()
        }
      });

      logger.error(`Job failed: ${error.message}`);
    }
  }

  async processSocialMediaPost(payload: any, logger: JobLogger) {
    const post = await db.post.findUnique({
      where: { id: payload.postId },
      include: { authProviders: true }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Publish to social media platforms
    for (const provider of post.authProviders) {
      await publishToProvider(provider, post, logger);
    }

    await db.post.update({
      where: { id: post.id },
      data: { status: 'SENT' }
    });

    return { published: true, platforms: post.authProviders.length };
  }

  async generateSuggestions(payload: any, logger: JobLogger) {
    const users = await db.user.findMany({
      where: { isActive: true }
    });

    logger.info(`Generating suggestions for ${users.length} users`);

    for (const user of users) {
      // Generate AI suggestions logic here
      const suggestions = await generateAISuggestions(user);
      await saveSuggestions(user.id, suggestions);
    }

    return { usersProcessed: users.length };
  }

  async sendEmail(payload: any, logger: JobLogger) {
    // Email sending logic
    logger.info(`Sending email to ${payload.to}`);
    await sendEmailViaProvider(payload);
    return { sent: true };
  }
}

// Start the processor
const processor = new JobProcessor();
processor.start().catch(console.error);
```

### Pros
✅ **No additional infrastructure**: Uses existing PM2 and PostgreSQL  
✅ **Simple deployment**: Single ecosystem config file  
✅ **Process management**: PM2 handles restarts, monitoring, logs  
✅ **Database as queue**: PostgreSQL provides ACID guarantees  
✅ **Easy scaling**: Can run multiple worker instances  

### Cons
❌ **Polling overhead**: Database polling less efficient than pub/sub  
❌ **PM2 dependency**: Tied to PM2 ecosystem  
❌ **Limited queuing features**: No advanced queue features  

---

## Plan 2: Native Linux Cron + Node.js Scripts

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   System Cron  │ -> │   Node.js       │ -> │   PostgreSQL    │
│   (crontab)     │    │   Scripts        │    │   Job Queue     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Implementation Details

#### 1. Crontab Configuration
```bash
# /etc/cron.d/automapost-jobs

# Social media posts - every minute
* * * * * node /var/www/automapost/scripts/social-media-scheduler.js >> /var/log/automapost/social-media.log 2>&1

# Daily suggestions - 8 AM daily
0 8 * * * node /var/www/automapost/scripts/daily-suggestions.js >> /var/log/automapost/suggestions.log 2>&1

# Email verification - every 6 hours
0 */6 * * * node /var/www/automapost/scripts/email-verification.js >> /var/log/automapost/email.log 2>&1

# Cleanup stuck jobs - every 10 minutes
*/10 * * * * node /var/www/automapost/scripts/cleanup-jobs.js >> /var/log/automapost/cleanup.log 2>&1

# Analytics aggregation - 2 AM daily
0 2 * * * node /var/www/automapost/scripts/analytics.js >> /var/log/automapost/analytics.log 2>&1
```

#### 2. Script Implementation
```typescript
// scripts/social-media-scheduler.js
#!/usr/bin/env node
import { db } from '../lib/db';
import { JobLogger } from '../lib/jobs/logger';

async function main() {
  const executionId = crypto.randomUUID();
  const logger = new JobLogger(executionId);
  
  try {
    logger.info('Starting social media scheduler');
    
    // Find posts ready to be published
    const posts = await db.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledTo: { lte: new Date() },
        deletedAt: null
      },
      include: { authProviders: true }
    });

    logger.info(`Found ${posts.length} posts to publish`);

    for (const post of posts) {
      try {
        await publishPost(post, logger);
        
        await db.post.update({
          where: { id: post.id },
          data: { status: 'SENT' }
        });
        
      } catch (error) {
        logger.error(`Failed to publish post ${post.id}: ${error.message}`);
      }
    }

    logger.info('Social media scheduler completed');
    process.exit(0);
    
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Prevent multiple instances
const lockFile = '/var/run/automapost-social-media.lock';
if (fs.existsSync(lockFile)) {
  const pid = fs.readFileSync(lockFile, 'utf8');
  try {
    process.kill(parseInt(pid), 0);
    console.log('Another instance is running');
    process.exit(0);
  } catch (e) {
    // Process doesn't exist, remove stale lock
    fs.unlinkSync(lockFile);
  }
}

fs.writeFileSync(lockFile, process.pid.toString());
process.on('exit', () => fs.unlinkSync(lockFile));

main();
```

#### 3. Systemd Timer Alternative (More Modern)
```ini
# /etc/systemd/system/automapost-social-media.service
[Unit]
Description=AutomaPost Social Media Scheduler
After=network.target

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/var/www/automapost
ExecStart=/usr/bin/node /var/www/automapost/scripts/social-media-scheduler.js
StandardOutput=journal
StandardError=journal

# /etc/systemd/system/automapost-social-media.timer
[Unit]
Description=Run AutomaPost Social Media Scheduler every minute
Requires=automapost-social-media.service

[Timer]
OnCalendar=*:0/1
AccuracySec=1s

[Install]
WantedBy=timers.target
```

### Pros
✅ **System-level reliability**: OS handles scheduling  
✅ **No process manager needed**: Direct system integration  
✅ **Resource efficient**: Scripts run only when needed  
✅ **Easy debugging**: Standard Unix tools work  

### Cons
❌ **Manual deployment**: Need to update crontab on changes  
❌ **Limited monitoring**: Basic logging only  
❌ **No built-in retry**: Must implement manually  

---

## Plan 3: Hybrid PM2 + PostgreSQL Listen/Notify

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PM2 Process  │ <- │   PG LISTEN     │ <- │   PG NOTIFY     │
│   (Long-running)│    │   (Real-time)    │    │   (Triggers)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Implementation Details

#### 1. PostgreSQL Triggers and Notifications
```sql
-- Create notification function
CREATE OR REPLACE FUNCTION notify_job_queue() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('job_queue_channel', 
    json_build_object(
      'id', NEW.id,
      'type', NEW.job_type,
      'priority', NEW.priority
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new jobs
CREATE TRIGGER job_queue_notify
AFTER INSERT ON job_queue
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION notify_job_queue();
```

#### 2. Long-running Worker with Listen
```typescript
// workers/realtime-processor.ts
import { Client } from 'pg';
import { PostgresJobQueue } from '../lib/jobs/pg-queue';

class RealtimeJobProcessor {
  private pgClient: Client;
  private queue: PostgresJobQueue;
  private isProcessing: boolean = false;

  async start() {
    // Connect to PostgreSQL
    this.pgClient = new Client({
      connectionString: process.env.DATABASE_URL
    });
    await this.pgClient.connect();

    // Listen for notifications
    await this.pgClient.query('LISTEN job_queue_channel');
    
    this.pgClient.on('notification', async (msg) => {
      if (!this.isProcessing) {
        this.isProcessing = true;
        await this.processAvailableJobs();
        this.isProcessing = false;
      }
    });

    // Also run periodic checks
    setInterval(async () => {
      if (!this.isProcessing) {
        this.isProcessing = true;
        await this.processAvailableJobs();
        this.isProcessing = false;
      }
    }, 60000); // Every minute

    console.log('Realtime job processor started');
  }

  async processAvailableJobs() {
    const jobs = await this.queue.dequeue(['social-media-post'], 10);
    
    for (const job of jobs) {
      await this.processJob(job);
    }
  }
}
```

### Pros
✅ **Real-time processing**: Instant job execution via LISTEN/NOTIFY  
✅ **Efficient**: No polling overhead  
✅ **Database-native**: Uses PostgreSQL features  

### Cons
❌ **Complexity**: More complex setup  
❌ **Connection management**: Need persistent DB connections  
❌ **PostgreSQL specific**: Tied to PostgreSQL  

---

## Recommendation

**Plan 1 (PM2 Ecosystem with Built-in Cron)** is the recommended approach because:

1. **Uses existing infrastructure**: No new dependencies (PM2 already in use)
2. **Simple deployment**: One ecosystem file manages everything
3. **Built-in monitoring**: PM2 provides logs, metrics, and auto-restart
4. **PostgreSQL as queue**: Leverages existing database for job queue
5. **Production ready**: PM2 is battle-tested in production

### Implementation Timeline

**Week 1**: Database schema and basic queue
- Set up job tables
- Implement PostgreSQL queue
- Create job logger

**Week 2**: Core job implementations
- Social media posting (1-minute checks)
- Daily email verification
- AI suggestions generation

**Week 3**: PM2 integration and testing
- Configure ecosystem file
- Set up worker processes
- Test job execution and logging

**Week 4**: Monitoring and optimization
- Add job dashboard
- Optimize query performance
- Load testing and tuning

**Total**: 4 weeks

This approach provides a solid, production-ready solution using your existing infrastructure without adding complexity or new dependencies.