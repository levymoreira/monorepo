import { db as prisma } from '@/lib/db';
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
  const activeSessions = await prisma.session.count({
    where: {
      userId,
      isActive: true
    }
  });
  
  // If limit exceeded, revoke oldest session
  if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
    const oldestSession = await prisma.session.findFirst({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        lastActivityAt: 'asc'
      }
    });
    
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
  const session = await prisma.session.create({
    data: {
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
    }
  });
  
  return {
    session,
    sessionToken,
    refreshToken
  };
}

// Get active session
export async function getSession(sessionId: string) {
  return prisma.session.findFirst({
    where: {
      id: sessionId,
      isActive: true,
      refreshTokenExpires: {
        gt: new Date()
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          emailVerified: true,
          onboardingCompleted: true
        }
      }
    }
  });
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
  await prisma.session.update({
    where: { id: sessionId },
    data: { lastActivityAt: new Date() }
  });
  
  return true;
}

// Revoke session
export async function revokeSession(sessionId: string, reason?: string) {
  return prisma.session.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason
    }
  });
}

// Revoke all user sessions
export async function revokeAllUserSessions(userId: string, reason?: string) {
  return prisma.session.updateMany({
    where: {
      userId,
      isActive: true
    },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason
    }
  });
}

// Get user's active sessions
export async function getUserSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: {
      lastActivityAt: 'desc'
    },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      deviceFingerprint: true,
      createdAt: true,
      lastActivityAt: true
    }
  });
}

// Refresh session tokens
export async function refreshSession(
  refreshToken: string
): Promise<{
  session: any;
  newRefreshToken: string;
} | null> {
  // Allow refresh even if session became inactive due to idle timeout, as long as the refresh token is not expired
  const session = await prisma.session.findFirst({
    where: {
      refreshToken,
      refreshTokenExpires: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });
  
  if (!session) {
    return null;
  }
  
  // Generate new refresh token (token rotation)
  const newRefreshToken = nanoid(64);
  
  // Reactivate or renew the session: rotate tokens, extend expiries, and mark active
  const updatedSession = await prisma.session.update({
    where: { id: session.id },
    data: {
      isActive: true,
      refreshToken: newRefreshToken,
      accessTokenExpires: new Date(Date.now() + 3600000), // 1 hour
      refreshTokenExpires: new Date(Date.now() + 2592000000), // 30 days
      lastActivityAt: new Date()
    },
    include: {
      user: true
    }
  });
  
  return {
    session: updatedSession,
    newRefreshToken
  };
}

// Clean up expired sessions (to be run periodically)
export async function cleanupExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: {
      OR: [
        {
          refreshTokenExpires: {
            lt: new Date()
          }
        },
        {
          isActive: false,
          revokedAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        }
      ]
    }
  });
  
  return result.count;
}

// Validate session exists in database (for middleware/API)
export async function validateSessionInDb(sessionId: string, updateActivity: boolean = false): Promise<boolean> {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        isActive: true,
        refreshTokenExpires: {
          gt: new Date()
        }
      }
    });
    
    if (!session) {
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
        await prisma.session.update({
          where: { id: sessionId },
          data: { lastActivityAt: new Date() }
        });
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
