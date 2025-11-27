import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getUserProfile } from '@/lib/auth/providers/config';
import { findOrCreateUser } from '@/lib/auth/user-sync';
import { createSession } from '@/lib/auth/session';
import { generateAccessToken } from '@/lib/auth/jwt';
import { logActivity } from '@/lib/auth/activity';
import { getCookieConfig } from '@/lib/auth/cookie-config';
import { locales, defaultLocale } from '@/lib/i18n/config';

// Ensure Prisma/Node APIs are available
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  
  // Locale resolution
  const supportedLocales = new Set(locales.map(l => l.code));
  const redirectCookie = request.cookies.get('oauth_redirect');
  const resolveLocale = (): string => {
    const redirectTo = redirectCookie?.value;
    if (redirectTo && redirectTo.startsWith('/')) {
      const first = redirectTo.split('/').filter(Boolean)[0];
      if (supportedLocales.has(first as any)) return first;
    }
    const nextCookie = request.cookies.get('NEXT_LOCALE')?.value;
    if (nextCookie && supportedLocales.has(nextCookie as any)) return nextCookie;
    const accept = (request.headers.get('accept-language') || '').toLowerCase();
    const match = Array.from(supportedLocales).find(code => accept.includes(code.toLowerCase()));
    return match || defaultLocale;
  };
  const locale = resolveLocale();
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
  
  let providerForLog = 'unknown';
  try {
    const { provider: providerParam } = await params;
    const provider = providerParam.toLowerCase();
    providerForLog = provider;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Get redirect URL from cookie to determine context
    const redirectTo = redirectCookie?.value;
    const isOnboarding = redirectTo?.includes('/onboarding');
    const errorRedirect = isOnboarding ? `${localePrefix}/onboarding` : `${localePrefix}/login`;
    
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, searchParams.get('error_description'));
      return NextResponse.redirect(
        new URL(`${errorRedirect}?error=oauth_${error}`, request.url)
      );
    }
    
    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(`${errorRedirect}?error=invalid_request`, request.url)
      );
    }
    
    // Validate state to prevent CSRF
    const cookieName = `oauth_state_${provider}`;
    const allCookies = request.cookies.getAll();
    const stateCookies = allCookies.filter(c => c.name === cookieName);
    const stateValues = stateCookies.map(c => c.value).filter(Boolean) as string[];
    const storedState = request.cookies.get(cookieName)?.value;

    const anyMatch = stateValues.some(v => v === state);

    // Strict state validation - no bypasses
    if (!anyMatch) {
      console.error('=== STATE VALIDATION FAILED ===');
      console.error('State values present:', stateValues.length);
      console.error('State comparison:', {
        stored: storedState || 'NOT_FOUND',
        received: state,
        match: storedState === state
      });
      console.error('================================');
      
      // Log security event
      await logActivity({
        userId: null,
        email: null,
        action: 'oauth_state_mismatch',
        provider,
        sessionId: null,
        success: false,
        request
      });
      
      return NextResponse.redirect(
        new URL(`${errorRedirect}?error=invalid_state`, request.url)
      );
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider, code);
    
    // Get user profile from provider
    const profile = await getUserProfile(provider, tokens.access_token);
    
    // Find or create user
    const { user, isNew } = await findOrCreateUser({
      provider,
      providerAccountId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
      tokens
    });
    
    // Create session (opaque DB refresh token) and generate JWT access token
    const { session, refreshToken } = await createSession(
      user.id,
      request
    );

    const accessToken = await generateAccessToken(user, session.id);
    
    // Log activity
    await logActivity({
      userId: user.id,
      email: user.email,
      action: isNew ? 'signup' : 'signin',
      provider,
      sessionId: session.id,
      success: true,
      request
    });
    
    // Determine redirect URL
    let redirectUrl: string;
    
    if (isNew) {
      // New users always go to onboarding step 2 (LinkedIn is already connected)
      redirectUrl = `${localePrefix}/onboarding?step=2`;
    } else if (!user.onboardingCompleted) {
      // Existing users who haven't completed onboarding continue from step 2
      redirectUrl = `${localePrefix}/onboarding?step=2`;
    } else if (redirectCookie?.value && !redirectCookie.value.includes('/portal')) {
      // Existing completed users: use stored redirect URL if it's a specific protected page (not the generic /portal)
      redirectUrl = redirectCookie.value;
    } else {
      // Existing completed users: default to portal (ignore generic /portal redirect)
      redirectUrl = `${localePrefix}/portal`;
    }
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    
    // Set authentication cookies
    response.cookies.set('automapost_access', accessToken, getCookieConfig(3600)); // 1 hour
    
    response.cookies.set('automapost_refresh', refreshToken, getCookieConfig(2592000, '/api/auth/refresh')); // 30 days
    
    // Clear OAuth state cookies
    response.cookies.delete(`oauth_state_${provider}`);
    if (redirectCookie) {
      response.cookies.delete('oauth_redirect');
    }
    
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Log failed attempt
    const email = request.nextUrl.searchParams.get('email') || 'unknown';
    await logActivity({
      email,
      action: 'failed_signin',
      provider: providerForLog,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      request
    });
    
    const isOnboarding = (redirectCookie?.value || '').includes('/onboarding');
    const fallbackErrorRedirect = isOnboarding ? `${localePrefix}/onboarding?error=auth_failed` : `${localePrefix}/login?error=auth_failed`;
    return NextResponse.redirect(
      new URL(fallbackErrorRedirect, request.url)
    );
  }
}
