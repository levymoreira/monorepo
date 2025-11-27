import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth/user-sync';
import { validateSessionInDb } from '@/lib/auth/session';
import { clearAuthCookies } from '@/lib/auth/cookies';

export async function GET(request: NextRequest) {
  try {
    // Get user ID and session ID from headers (set by middleware)
    const userId = request.headers.get('X-User-Id');
    const sessionId = request.headers.get('X-Session-Id');
    
    if (!userId || !sessionId) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }
    
    // Validate session exists in database
    const sessionValid = await validateSessionInDb(sessionId);
    if (!sessionValid) {
      const response = NextResponse.json(
        { error: 'Session expired or revoked' },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }
    
    // Get user data
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user data (excluding sensitive fields)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      role: user.role,
      interests: user.interests,
      connectedProviders: user.authProviders.map(p => ({
        id: p.id,
        provider: p.provider,
        providerId: p.providerAccountId,
        connectedAt: p.createdAt
      })),
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get current user error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
