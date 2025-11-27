import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { revokeSession } from '@/lib/auth/session';
import { logActivity } from '@/lib/auth/activity';

export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('automapost_access')?.value;
    
    if (accessToken) {
      // Verify token to get session info
      const payload = await verifyAccessToken(accessToken);
      
      if (payload) {
        // Revoke the session
        await revokeSession(payload.sessionId, 'User logout');
        
        // Log activity
        await logActivity({
          userId: payload.sub,
          email: payload.email,
          action: 'signout',
          provider: 'manual',
          sessionId: payload.sessionId,
          success: true,
          request
        });
      }
    }
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Clear authentication cookies with explicit expiration
    response.cookies.set('automapost_access', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0) // Set to epoch (January 1, 1970)
    });
    
    response.cookies.set('automapost_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      expires: new Date(0) // Set to epoch (January 1, 1970)
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies
    const response = NextResponse.json(
      { error: 'Logout failed', success: false },
      { status: 500 }
    );
    
    // Clear authentication cookies with explicit expiration
    response.cookies.set('automapost_access', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0) // Set to epoch (January 1, 1970)
    });
    
    response.cookies.set('automapost_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      expires: new Date(0) // Set to epoch (January 1, 1970)
    });
    
    return response;
  }
}
