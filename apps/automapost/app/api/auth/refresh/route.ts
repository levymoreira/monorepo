import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken } from '@/lib/auth/jwt';
import { refreshSession } from '@/lib/auth/session';
import { logActivity } from '@/lib/auth/activity';
import { getCookieConfig } from '@/lib/auth/cookie-config';
import { clearAuthCookies } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie (opaque DB token)
    const refreshToken = request.cookies.get('automapost_refresh')?.value;

    if (!refreshToken) {
      const response = NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }

    // Refresh the session using the opaque token
    const sessionResult = await refreshSession(refreshToken);

    if (!sessionResult) {
      const response = NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 401 }
      );
      return clearAuthCookies(response);
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken(
      sessionResult.session.user,
      sessionResult.session.id
    );

    // Log activity
    await logActivity({
      userId: sessionResult.session.user.id,
      email: sessionResult.session.user.email,
      action: 'token_refresh',
      provider: 'system',
      sessionId: sessionResult.session.id,
      success: true,
      request
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken
    });

    // Set new tokens as cookies
    response.cookies.set('automapost_access', newAccessToken, getCookieConfig(3600)); // 1 hour
    response.cookies.set('automapost_refresh', sessionResult.newRefreshToken, getCookieConfig(2592000, '/api/auth/refresh')); // 30 days

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);

    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
