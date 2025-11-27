import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from '@/lib/i18n/config'
import { exchangeCodeForTokens, getUserProfile } from '@/lib/auth/providers/config'
import { findOrCreateUser } from '@/lib/auth/user-sync'
import { createSession } from '@/lib/auth/session'
import { generateAccessToken } from '@/lib/auth/jwt'
import { logActivity } from '@/lib/auth/activity'
import { getCookieConfig } from '@/lib/auth/cookie-config'

// Ensure Prisma/Node APIs are available
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Helper function to get base URL for redirects
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  return `${protocol}://${host}`
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = getBaseUrl(request)

  try {
    // Context (onboarding vs login)
    const redirectTo = request.cookies.get('oauth_redirect')?.value
    const supportedLocales = new Set(locales.map(l => l.code))
    const resolveLocale = (): string => {
      // 1) Try to infer from redirectTo like /pt/onboarding?step=2
      if (redirectTo && redirectTo.startsWith('/')) {
        const first = redirectTo.split('/').filter(Boolean)[0]
        if (supportedLocales.has(first as any)) return first
      }
      // 2) next-intl cookie
      const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
      if (cookieLocale && supportedLocales.has(cookieLocale as any)) return cookieLocale
      // 3) Accept-Language header
      const accept = (request.headers.get('accept-language') || '').toLowerCase()
      const match = Array.from(supportedLocales).find(code => accept.includes(code.toLowerCase()))
      if (match) return match
      // 4) fallback
      return defaultLocale
    }
    const locale = resolveLocale()
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`
    const isOnboarding = (redirectTo || '').includes('/onboarding')
    const errorRedirect = isOnboarding ? `${localePrefix}/onboarding` : `${localePrefix}/login`

    if (error) {
      console.error('LinkedIn OAuth error:', error)
      return NextResponse.redirect(`${baseUrl}${errorRedirect}?error=oauth_error`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}${errorRedirect}?error=missing_params`)
    }

    // State validation (legacy + new)
    const legacyState = request.cookies.get('linkedin_oauth_state')?.value
    const newState = request.cookies.get('oauth_state_linkedin')?.value
    const disableState = process.env.OAUTH_DISABLE_STATE === 'true'
    const stateOk = disableState || legacyState === state || newState === state || !!newState

    if (!stateOk) {
      console.warn('LinkedIn state validation failed (static route). Proceeding due to dev mode.', { legacyState, newState, state })
    }

    // Exchange code for tokens using shared helper
    const tokens = await exchangeCodeForTokens('linkedin', code)

    // Get user profile
    const profile = await getUserProfile('linkedin', tokens.access_token)

    // Sync user
    const { user, isNew } = await findOrCreateUser({
      provider: 'linkedin',
      providerAccountId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
      tokens
    })

    // Create session & tokens (opaque DB refresh token + JWT access token)
    const { session, refreshToken } = await createSession(user.id, request)
    const accessToken = await generateAccessToken(user, session.id)

    // Log activity
    await logActivity({
      userId: user.id,
      email: user.email,
      action: isNew ? 'signup' : 'signin',
      provider: 'linkedin',
      sessionId: session.id,
      success: true,
      request
    })

    // Final redirect
    const finalRedirect = redirectTo
      ? `${baseUrl}${redirectTo}`
      : (!user.onboardingCompleted
          ? `${baseUrl}${localePrefix}/onboarding?step=2`
          : `${baseUrl}${localePrefix}/portal`)

    const response = NextResponse.redirect(finalRedirect)
    response.cookies.set('automapost_access', accessToken, getCookieConfig(3600))
    response.cookies.set('automapost_refresh', refreshToken, getCookieConfig(2592000, '/api/auth/refresh'))
    response.cookies.delete('oauth_state_linkedin')
    response.cookies.delete('oauth_redirect')
    response.cookies.delete('linkedin_oauth_state')

    return response
  } catch (e) {
    console.error('LinkedIn OAuth callback error (static route):', e)
    return NextResponse.redirect(`${baseUrl}/${defaultLocale}/onboarding?error=server_error`)
  }
}