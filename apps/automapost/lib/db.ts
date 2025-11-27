import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database URL - read from environment variables
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // During build time, we don't need a real database connection
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('DATABASE_URL not set during build phase - using placeholder')
  } else {
    throw new Error('DATABASE_URL environment variable is not set')
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
