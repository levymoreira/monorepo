import { db, sessions, users } from '@/lib/db';
import { eq, and, lt, or, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

// Session configuration
const MAX_CONCURRENT_SESSIONS = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5');
// Default idle timeout: 24 hours (can be overridden with env var SESSION_IDLE_TIMEOUT)
const SESSION_IDLE_TIMEOUT = parseInt(process.env.SESSION_IDLE_TIMEOUT || '86400000');

// Generate device fingerprint
export function generateDeviceFingerprint(userAgent: string, ipAddress?: string): string {
  const ua = new UAParser(userAgent);
  const browser = ua.getBrowser();
  const os = ua.getOS();
  const device = ua.getDevice();
  
  const fingerprintData = [
    browser.name,
    browser.version,
    os.name,
    os.version,
    device.type || 'desktop',
    ipAddress?.split('.').slice(0, 3).join('.') // Use first 3 octets of IP
  ].filter(Boolean).join('|');
  
  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

// Parse user agent
export function parseUserAgent(userAgent: string) {
  const ua = new UAParser(userAgent);
  const browser = ua.getBrowser();
  const os = ua.getOS();
  const device = ua.getDevice();
  
  return {
    browser: browser.name,
    browserVersion: browser.version,
    os: os.name,
    osVersion: os.version,
    device: device.model,
    deviceType: device.type || 'desktop'
  };
}

// Create a new session
export async function createSession(
  userId: string,
  request: Request
): Promise<{
  session: any;
  sessionToken: string;
  refreshToken: string;
}> {
  // Check concurrent sessions limit
  const activeSessions = await db.select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)));
  
  // If limit exceeded, revoke oldest session
  if (activeSessions.length >= MAX_CONCURRENT_SESSIONS) {
    const [oldestSession] = await db.select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)))
      .orderBy(asc(sessions.lastActivityAt))
      .limit(1);
    
    if (oldestSession) {
      await revokeSession(oldestSession.id, 'Concurrent session limit exceeded');
    }
  }
  
  // Extract request metadata
  const userAgent = request.headers.get('user-agent') || '';
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    null;
  
  const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress || undefined);
  
  // Generate tokens
  const sessionToken = nanoid(32);
  const refreshToken = nanoid(64);
  
  // Calculate expiry times
  const accessTokenExpires = new Date(Date.now() + 3600000); // 1 hour
  const refreshTokenExpires = new Date(Date.now() + 2592000000); // 30 days
  
  // Create session
  const [session] = await db.insert(sessions).values({
    userId,
    sessionToken,
    refreshToken,
    ipAddress,
    userAgent,
    deviceFingerprint,
    accessTokenExpires,
    refreshTokenExpires,
    isActive: true,
    lastActivityAt: new Date()
  }).returning();
  
  return {
    session,
    sessionToken,
    refreshToken
  };
}

// Get active session
export async function getSession(sessionId: string) {
  const [session] = await db.select({
    id: sessions.id,
    userId: sessions.userId,
    sessionToken: sessions.sessionToken,
    refreshToken: sessions.refreshToken,
    ipAddress: sessions.ipAddress,
    userAgent: sessions.userAgent,
    deviceFingerprint: sessions.deviceFingerprint,
    accessTokenExpires: sessions.accessTokenExpires,
    refreshTokenExpires: sessions.refreshTokenExpires,
    isActive: sessions.isActive,
    revokedAt: sessions.revokedAt,
    revokedReason: sessions.revokedReason,
    createdAt: sessions.createdAt,
    updatedAt: sessions.updatedAt,
    lastActivityAt: sessions.lastActivityAt,
    user: {
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      emailVerified: users.emailVerified,
      onboardingCompleted: users.onboardingCompleted
    }
  })
  .from(sessions)
  .leftJoin(users, eq(sessions.userId, users.id))
  .where(and(
    eq(sessions.id, sessionId),
    eq(sessions.isActive, true)
  ))
  .limit(1);
  
  if (!session || !session.refreshTokenExpires || new Date() > session.refreshTokenExpires) {
    return null;
  }
  
  return session;
}

// Validate session
export async function validateSession(sessionId: string): Promise<boolean> {
  const session = await getSession(sessionId);
  
  if (!session) {
    return false;
  }
  
  // Check if session has been idle too long
  const idleTime = Date.now() - session.lastActivityAt.getTime();
  if (idleTime > SESSION_IDLE_TIMEOUT) {
    await revokeSession(sessionId, 'Session idle timeout');
    return false;
  }
  
  // Update last activity
  await db.update(sessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(sessions.id, sessionId));
  
  return true;
}

// Revoke session
export async function revokeSession(sessionId: string, reason?: string) {
  return db.update(sessions)
    .set({
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason
    })
    .where(eq(sessions.id, sessionId));
}

// Revoke all user sessions
export async function revokeAllUserSessions(userId: string, reason?: string) {
  return db.update(sessions)
    .set({
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason
    })
    .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)));
}

// Get user's active sessions
export async function getUserSessions(userId: string) {
  return db.select({
    id: sessions.id,
    ipAddress: sessions.ipAddress,
    userAgent: sessions.userAgent,
    deviceFingerprint: sessions.deviceFingerprint,
    createdAt: sessions.createdAt,
    lastActivityAt: sessions.lastActivityAt
  })
  .from(sessions)
  .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)))
  .orderBy(asc(sessions.lastActivityAt));
}

// Refresh session tokens
export async function refreshSession(
  refreshTokenValue: string
): Promise<{
  session: any;
  newRefreshToken: string;
} | null> {
  // Allow refresh even if session became inactive due to idle timeout, as long as the refresh token is not expired
  const [session] = await db.select()
    .from(sessions)
    .leftJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.refreshToken, refreshTokenValue))
    .limit(1);
  
  if (!session || !session.sessions.refreshTokenExpires || new Date() > session.sessions.refreshTokenExpires) {
    return null;
  }
  
  // Generate new refresh token (token rotation)
  const newRefreshToken = nanoid(64);
  
  // Reactivate or renew the session: rotate tokens, extend expiries, and mark active
  const [updatedSession] = await db.update(sessions)
    .set({
      isActive: true,
      refreshToken: newRefreshToken,
      accessTokenExpires: new Date(Date.now() + 3600000), // 1 hour
      refreshTokenExpires: new Date(Date.now() + 2592000000), // 30 days
      lastActivityAt: new Date()
    })
    .where(eq(sessions.id, session.sessions.id))
    .returning();
  
  return {
    session: { ...updatedSession, user: session.users },
    newRefreshToken
  };
}

// Clean up expired sessions (to be run periodically)
export async function cleanupExpiredSessions() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const result = await db.delete(sessions)
    .where(or(
      lt(sessions.refreshTokenExpires, new Date()),
      and(
        eq(sessions.isActive, false),
        lt(sessions.revokedAt, sevenDaysAgo)
      )
    ))
    .returning({ id: sessions.id });
  
  return result.length;
}

// Validate session exists in database (for middleware/API)
export async function validateSessionInDb(sessionId: string, updateActivity: boolean = false): Promise<boolean> {
  try {
    const [session] = await db.select()
      .from(sessions)
      .where(and(
        eq(sessions.id, sessionId),
        eq(sessions.isActive, true)
      ))
      .limit(1);
    
    if (!session || !session.refreshTokenExpires || new Date() > session.refreshTokenExpires) {
      return false;
    }
    
    // Check if session has been idle too long
    const idleTime = Date.now() - session.lastActivityAt.getTime();
    if (idleTime > SESSION_IDLE_TIMEOUT) {
      await revokeSession(sessionId, 'Session idle timeout');
      return false;
    }
    
    // Update last activity if requested (throttled to once per minute)
    if (updateActivity) {
      const timeSinceLastUpdate = Date.now() - session.lastActivityAt.getTime();
      if (timeSinceLastUpdate > 60000) { // Only update if more than 1 minute has passed
        await db.update(sessions)
          .set({ lastActivityAt: new Date() })
          .where(eq(sessions.id, sessionId));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

// Detect suspicious session activity
export async function detectSuspiciousActivity(
  sessionId: string,
  currentFingerprint: string
): Promise<boolean> {
  const session = await getSession(sessionId);
  
  if (!session) {
    return true; // Session not found is suspicious
  }
  
  // Check if device fingerprint changed
  if (session.deviceFingerprint !== currentFingerprint) {
    await revokeSession(sessionId, 'Device fingerprint mismatch - possible session hijacking');
    return true;
  }
  
  return false;
}
