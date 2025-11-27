import { db, sisuActivities } from '@/lib/db';
import { eq, gte, and, inArray, isNotNull, count, desc } from 'drizzle-orm';
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
    await db.insert(sisuActivities).values({
      ...activityData,
      ...metadata,
      createdAt: new Date()
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
  return db.select({
    id: sisuActivities.id,
    action: sisuActivities.action,
    provider: sisuActivities.provider,
    ipAddress: sisuActivities.ipAddress,
    browser: sisuActivities.browser,
    os: sisuActivities.os,
    deviceType: sisuActivities.deviceType,
    country: sisuActivities.country,
    city: sisuActivities.city,
    success: sisuActivities.success,
    createdAt: sisuActivities.createdAt
  })
  .from(sisuActivities)
  .where(eq(sisuActivities.userId, userId))
  .orderBy(desc(sisuActivities.createdAt))
  .limit(limit);
}

// Check for suspicious activity patterns
export async function checkSuspiciousActivity(email: string): Promise<{
  isSuspicious: boolean;
  reason?: string;
}> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const recentActivities = await db.select()
    .from(sisuActivities)
    .where(and(
      eq(sisuActivities.email, email),
      gte(sisuActivities.createdAt, fifteenMinutesAgo)
    ))
    .orderBy(desc(sisuActivities.createdAt));
  
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
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  
  const [result] = await db.select({ count: count() })
    .from(sisuActivities)
    .where(and(
      eq(sisuActivities.email, email),
      eq(sisuActivities.action, 'failed_signin'),
      eq(sisuActivities.success, false),
      gte(sisuActivities.createdAt, cutoffTime)
    ));
  
  return result?.count || 0;
}

// Get activity summary for analytics
export async function getActivitySummary(days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const [
    totalSignupsResult,
    totalSigninsResult,
    uniqueUsersResult,
    failedAttemptsResult,
    activitiesByProviderResult,
    activitiesByCountryResult
  ] = await Promise.all([
    // Total signups
    db.select({ count: count() })
      .from(sisuActivities)
      .where(and(
        eq(sisuActivities.action, 'signup'),
        eq(sisuActivities.success, true),
        gte(sisuActivities.createdAt, startDate)
      )),
    
    // Total signins
    db.select({ count: count() })
      .from(sisuActivities)
      .where(and(
        eq(sisuActivities.action, 'signin'),
        eq(sisuActivities.success, true),
        gte(sisuActivities.createdAt, startDate)
      )),
    
    // Unique users
    db.selectDistinct({ userId: sisuActivities.userId })
      .from(sisuActivities)
      .where(and(
        inArray(sisuActivities.action, ['signin', 'signup']),
        eq(sisuActivities.success, true),
        gte(sisuActivities.createdAt, startDate),
        isNotNull(sisuActivities.userId)
      )),
    
    // Failed attempts
    db.select({ count: count() })
      .from(sisuActivities)
      .where(and(
        eq(sisuActivities.action, 'failed_signin'),
        gte(sisuActivities.createdAt, startDate)
      )),
    
    // Activities by provider
    db.select({
      provider: sisuActivities.provider,
      count: count()
    })
    .from(sisuActivities)
    .where(and(
      inArray(sisuActivities.action, ['signin', 'signup']),
      eq(sisuActivities.success, true),
      gte(sisuActivities.createdAt, startDate)
    ))
    .groupBy(sisuActivities.provider),
    
    // Activities by country
    db.select({
      country: sisuActivities.country,
      count: count()
    })
    .from(sisuActivities)
    .where(and(
      inArray(sisuActivities.action, ['signin', 'signup']),
      eq(sisuActivities.success, true),
      isNotNull(sisuActivities.country),
      gte(sisuActivities.createdAt, startDate)
    ))
    .groupBy(sisuActivities.country)
    .orderBy(desc(count()))
    .limit(10)
  ]);
  
  return {
    totalSignups: totalSignupsResult[0]?.count || 0,
    totalSignins: totalSigninsResult[0]?.count || 0,
    uniqueUsers: uniqueUsersResult.length,
    failedAttempts: failedAttemptsResult[0]?.count || 0,
    activitiesByProvider: activitiesByProviderResult.map(item => ({
      provider: item.provider,
      count: item.count
    })),
    topCountries: activitiesByCountryResult.map(item => ({
      country: item.country,
      count: item.count
    }))
  };
}
