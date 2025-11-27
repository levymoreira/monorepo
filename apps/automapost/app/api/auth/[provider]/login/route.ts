import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/auth/providers/config';
import { nanoid } from 'nanoid';
import { getCookieConfig } from '@/lib/auth/cookie-config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider: providerParam } = await params;
    const provider = providerParam.toLowerCase();
    
    // Validate provider
    if (!['linkedin', 'google'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }
    
    // Generate state for CSRF protection
    const state = nanoid(32);
    
    const authUrl = generateAuthUrl(provider, state);
    
    // Store state in cookie (expires in 10 minutes)
    const response = NextResponse.redirect(authUrl);
    
    // Set cookie with explicit settings for development
    const cookieOptions = getCookieConfig(600); // 10 minutes
    
    response.cookies.set(`oauth_state_${provider}`, state, cookieOptions);
    
    // Also store the redirect URL if provided
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    if (redirectTo) {
      response.cookies.set('oauth_redirect', redirectTo, getCookieConfig(600)); // 10 minutes
    }
    
    return response;
  } catch (error) {
    console.error('OAuth login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth login' },
      { status: 500 }
    );
  }
}
