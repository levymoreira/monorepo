import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale, localePrefix } from './lib/i18n/config'
import { verifyAccessToken, extractTokenFromRequest } from './lib/auth/jwt'
import { getCookieConfig } from './lib/auth/cookie-config'
import { clearAuthCookies } from './lib/auth/cookies'

const intlMiddleware = createIntlMiddleware({
  locales: locales.map(locale => locale.code),
  defaultLocale: defaultLocale,
  localePrefix: localePrefix
})

// Define protected routes (only UI routes, not API routes)
const protectedRoutes = ['/portal']
const authRoutes = ['/login', '/signin', '/signup']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Log OAuth callbacks for debugging
  if (pathname.includes('/api/auth/') && pathname.includes('/callback')) {
    console.log('[Middleware] OAuth callback detected:', {
      pathname,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
  }
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Protected API routes that need authentication
    const protectedApiRoutes = ['/api/user', '/api/posts', '/api/auth/me']
    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedApi) {
      try {
        const token = extractTokenFromRequest(request as any)
        
        if (!token) {
          const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          return clearAuthCookies(response);
        }
        
        const payload = await verifyAccessToken(token)
        
        if (!payload) {
          const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
          return clearAuthCookies(response);
        }
        
        // Note: Session database validation happens in the API routes themselves
        // Middleware runs in Edge Runtime which doesn't support Prisma
        
        // Forward user context as request headers to the downstream route
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('X-User-Id', payload.sub)
        requestHeaders.set('X-User-Email', payload.email)
        requestHeaders.set('X-Session-Id', payload.sessionId)

        return NextResponse.next({
          request: { headers: requestHeaders }
        })
      } catch (error) {
        console.error('API auth error:', error)
        const response = NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        return clearAuthCookies(response);
      }
    }
    
    // Non-protected API routes
    return NextResponse.next()
  }
  
  // Skip i18n/auth for static assets so files in /public (like .html) are served directly
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('.') // static files such as /test-oauth.html, images, etc.
  ) {
    return NextResponse.next()
  }
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.includes(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.includes(route)
  )
  
  if (isProtectedRoute) {
    try {
      // Extract and verify access token
      const token = extractTokenFromRequest(request as any)
      
      if (!token) {
        // No valid tokens, redirect to login
        const pathSegments = pathname.split('/').filter(Boolean)
        const firstSegment = pathSegments[0]
        const localeCodes = new Set(locales.map(l => l.code as string))
        const hasLocalePrefix = localeCodes.has(firstSegment)
        const loginPath = hasLocalePrefix ? `/${firstSegment}/login` : `/login`
        const loginUrl = new URL(loginPath, request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // Verify access token
      const payload = await verifyAccessToken(token)
      
      if (!payload) {
        const pathSegments = pathname.split('/').filter(Boolean)
        const firstSegment = pathSegments[0]
        const localeCodes = new Set(locales.map(l => l.code as string))
        const hasLocalePrefix = localeCodes.has(firstSegment)
        const loginPath = hasLocalePrefix ? `/${firstSegment}/login` : `/login`
        const loginUrl = new URL(loginPath, request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // Note: Session database validation happens in the page/API routes
      // Middleware runs in Edge Runtime which doesn't support Prisma
      
      // Add user context to headers for API routes (best-effort)
      const response = intlMiddleware(request)
      response.headers.set('X-User-Id', payload.sub)
      response.headers.set('X-User-Email', payload.email)
      response.headers.set('X-Session-Id', payload.sessionId)
      
      return response
    } catch (error) {
      console.error('Auth middleware error:', error)
      const pathSegments = pathname.split('/').filter(Boolean)
      const firstSegment = pathSegments[0]
      const localeCodes = new Set(locales.map(l => l.code as string))
      const hasLocalePrefix = localeCodes.has(firstSegment)
      const loginPath = hasLocalePrefix ? `/${firstSegment}/login` : `/login`
      const loginUrl = new URL(loginPath, request.url)
      loginUrl.searchParams.set('from', pathname)
      loginUrl.searchParams.set('error', 'auth_error')
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute) {
    const token = extractTokenFromRequest(request as any)
    
    if (token) {
      const payload = await verifyAccessToken(token)

      if (payload) {
        const pathSegments = pathname.split('/').filter(Boolean)
        const firstSegment = pathSegments[0]
        const localeCodes = new Set(locales.map(l => l.code as string))
        const hasLocalePrefix = localeCodes.has(firstSegment)
        const portalPath = hasLocalePrefix ? `/${firstSegment}/portal` : `/portal`
        return NextResponse.redirect(new URL(portalPath, request.url))
      }
    }
  }
  
  // For all other routes, just apply i18n middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}