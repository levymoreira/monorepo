import { db as prisma } from '@/lib/db';
import { parseUserAgent } from './session';

// Conditionally import geoip-lite only in runtime
let geoip: any = null;
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    geoip = require('geoip-lite');
  } catch (e) {
    console.warn('geoip-lite not available, geo-location will be disabled');
  }
}

export type AuthAction = 
  | 'signup'
  | 'signin'
  | 'signout'
  | 'failed_signin'
  | 'token_refresh'
  | 'session_revoked'
  | 'password_reset'
  | 'email_verified';

interface ActivityData {
  userId?: string;
  email: string;
  action: AuthAction;
  provider: string;
  sessionId?: string;
  ipAddress?: string | null;
  userAgent?: string;
  referer?: string | null;
  success?: boolean;
  errorMessage?: string;
}

// Log authentication activity
export async function logActivity(data: ActivityData & { request?: Request }) {
  try {
    const { request, ...activityData } = data;
    
    // Extract additional metadata from request if provided
    let metadata: any = {};
    
    if (request) {
      const userAgent = request.headers.get('user-agent') || '';
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                        request.headers.get('x-real-ip') || 
                        null;
      
      // Parse user agent
      if (userAgent) {
        const uaData = parseUserAgent(userAgent);
        metadata = {
          ...metadata,
          userAgent,
          ...uaData
        };
      }
      
      // Get geolocation data
      if (ipAddress) {
        if (geoip) {
          const geo = geoip.lookup(ipAddress);
          if (geo) {
            metadata.country = geo.country;
            metadata.city = geo.city;
            metadata.timezone = geo.timezone;
          }
        }
        metadata.ipAddress = ipAddress;
      }
      
      // Get language and referer
      metadata.language = request.headers.get('accept-language')?.split(',')[0] || null;
      metadata.referer = request.headers.get('referer') || null;
    }
    
    // Create activity record
    await prisma.sisuActivity.create({
      data: {
        ...activityData,
        ...metadata,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failures shouldn't break auth flow
  }
}

// Get user's recent activities
export async function getUserActivities(
  userId: string,
  limit: number = 10
) {
  return prisma.sisuActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      action: true,
      provider: true,
      ipAddress: true,
      browser: true,
      os: true,
      deviceType: true,
      country: true,
      city: true,
      success: true,
      createdAt: true
    }
  });
}

// Check for suspicious activity patterns
export async function checkSuspiciousActivity(email: string): Promise<{
  isSuspicious: boolean;
  reason?: string;
}> {
  const recentActivities = await prisma.sisuActivity.findMany({
    where: {
      email,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Check for multiple failed login attempts
  const failedAttempts = recentActivities.filter(a => 
    a.action === 'failed_signin' && !a.success
  );
  
  if (failedAttempts.length >= 5) {
    return {
      isSuspicious: true,
      reason: 'Multiple failed login attempts'
    };
  }
  
  // Check for rapid location changes
  const uniqueCountries = new Set(
    recentActivities
      .filter(a => a.country && a.success)
      .map(a => a.country)
  );
  
  if (uniqueCountries.size > 2) {
    return {
      isSuspicious: true,
      reason: 'Login attempts from multiple countries'
    };
  }
  
  // Check for unusual device changes
  const uniqueDevices = new Set(
    recentActivities
      .filter(a => a.deviceFingerprint && a.success)
      .map(a => a.deviceFingerprint)
  );
  
  if (uniqueDevices.size > 3) {
    return {
      isSuspicious: true,
      reason: 'Login attempts from multiple devices'
    };
  }
  
  return { isSuspicious: false };
}

// Get failed login attempts for an email
export async function getFailedLoginAttempts(
  email: string,
  minutes: number = 60
): Promise<number> {
  const count = await prisma.sisuActivity.count({
    where: {
      email,
      action: 'failed_signin',
      success: false,
      createdAt: {
        gte: new Date(Date.now() - minutes * 60 * 1000)
      }
    }
  });
  
  return count;
}

// Get activity summary for analytics
export async function getActivitySummary(days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const [
    totalSignups,
    totalSignins,
    uniqueUsers,
    failedAttempts,
    activitiesByProvider,
    activitiesByCountry
  ] = await Promise.all([
    // Total signups
    prisma.sisuActivity.count({
      where: {
        action: 'signup',
        success: true,
        createdAt: { gte: startDate }
      }
    }),
    
    // Total signins
    prisma.sisuActivity.count({
      where: {
        action: 'signin',
        success: true,
        createdAt: { gte: startDate }
      }
    }),
    
    // Unique users
    prisma.sisuActivity.findMany({
      where: {
        action: { in: ['signin', 'signup'] },
        success: true,
        createdAt: { gte: startDate }
      },
      distinct: ['userId'],
      select: { userId: true }
    }),
    
    // Failed attempts
    prisma.sisuActivity.count({
      where: {
        action: 'failed_signin',
        createdAt: { gte: startDate }
      }
    }),
    
    // Activities by provider
    prisma.sisuActivity.groupBy({
      by: ['provider'],
      where: {
        action: { in: ['signin', 'signup'] },
        success: true,
        createdAt: { gte: startDate }
      },
      _count: true
    }),
    
    // Activities by country
    prisma.sisuActivity.groupBy({
      by: ['country'],
      where: {
        action: { in: ['signin', 'signup'] },
        success: true,
        country: { not: null },
        createdAt: { gte: startDate }
      },
      _count: true,
      orderBy: {
        _count: {
          country: 'desc'
        }
      },
      take: 10
    })
  ]);
  
  return {
    totalSignups,
    totalSignins,
    uniqueUsers: uniqueUsers.length,
    failedAttempts,
    activitiesByProvider: activitiesByProvider.map(item => ({
      provider: item.provider,
      count: item._count
    })),
    topCountries: activitiesByCountry.map(item => ({
      country: item.country,
      count: item._count
    }))
  };
}
