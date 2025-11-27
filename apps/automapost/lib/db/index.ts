import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Database URL - read from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // During build time, we don't need a real database connection
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('DATABASE_URL not set during build phase - using placeholder');
  } else {
    throw new Error('DATABASE_URL environment variable is not set');
  }
}

// Create a global pool for connection reuse
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool = globalForDb.pool ?? new Pool({
  connectionString: databaseUrl,
  max: 10, // Maximum number of connections in the pool
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// Create drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export schema for use in queries
export * from './schema';
