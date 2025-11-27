# AutomaPost Authentication System Plan (SISU) - Custom Implementation

## 🚀 Implementation Status

### ✅ Completed (Sep 1, 2024)
- **JWT Infrastructure**: RSA key generation, token utilities, validation
- **Database Schema**: Session, AuthProvider, and SisuActivity tables created
- **Session Management**: Full session lifecycle with device fingerprinting
- **OAuth Providers**: LinkedIn and Google OAuth flow implemented
- **Authentication Endpoints**: Login, callback, logout, refresh, and user endpoints
- **Middleware**: JWT-based route protection with auto-refresh
- **Activity Tracking**: Comprehensive logging with geo-location
- **Client Integration**: useAuth hook and updated login page

### 🔨 Still To Do
- **Protected Layout Wrappers**: Need to wrap portal routes with auth guard
- **Onboarding Integration**: Update onboarding to use new auth system
- **Social Accounts Settings**: UI for managing connected accounts
- **Session Management UI**: Display active sessions and allow termination
- **Security Features**: Rate limiting, CAPTCHA for failed attempts
- **Testing**: Unit and integration tests for auth flows
- **Documentation**: API documentation and usage examples

## 1. Current Onboarding Analysis 📊

### Data Stored in Database (User table):
- **LinkedIn OAuth Data**:
  - `linkedinId`: LinkedIn user ID (sub from profile)
  - `linkedinAccessToken`: OAuth access token
  - `linkedinRefreshToken`: OAuth refresh token (if provided)
  - `email`: User's email from LinkedIn
  - `name`: User's name from LinkedIn

- **Onboarding Preferences**:
  - `role`: User's professional role
  - `interests`: Array of user's interests
  - `maxCommentsPerDay`: Auto-engagement setting (default: 5)
  - `maxLikesPerDay`: Auto-engagement setting (default: 10)
  - `onboardingCompleted`: Boolean flag

- **Timestamps**:
  - `createdAt`: Account creation time
  - `updatedAt`: Last modification time

### Data Persisted in Browser:
- **Cookies**:
  - `user_id`: User's database ID (30-day expiration, httpOnly)
  - `linkedin_oauth_state`: Temporary OAuth state (10-minute expiration)

### Current Flow Issues:
1. **No session management** - Just a simple user_id cookie
2. **No activity tracking** - No record of logins, devices, or locations
3. **No logout functionality** - Users can't sign out
4. **No re-authentication** - Users can't sign in again after logout
5. **Single provider only** - Only LinkedIn is supported

## 2. Proposed Authentication Architecture - Custom Implementation 🏗️

### Why Custom Implementation?
- **Full control**: Complete ownership of authentication flow and data
- **Cost efficiency**: No per-user pricing or vendor lock-in
- **Customization**: Tailor-made for AutomaPost's specific needs
- **Data sovereignty**: All user data stays in our infrastructure
- **Flexibility**: Easy to modify and extend authentication logic

### Database Schema Updates

```prisma
// User model - Custom Authentication
model User {
  id                   String   @id @default(uuid())
  email                String   @unique
  name                 String?
  avatarUrl            String?
  emailVerified        Boolean  @default(false)
  onboardingCompleted  Boolean  @default(false)
  
  // Onboarding preferences
  role                 String?
  interests            String[] @default([])
  maxCommentsPerDay    Int      @default(5)
  maxLikesPerDay       Int      @default(10)
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  // Relations
  authProviders        AuthProvider[]
  sessions             Session[]
  sisuActivities       SisuActivity[]

  @@map("users")
}

// OAuth Provider Information
model AuthProvider {
  id                   String   @id @default(uuid())
  userId               String
  provider             String   // 'linkedin', 'google', 'instagram', 'tiktok'
  providerAccountId    String   // Provider's user ID
  
  // OAuth tokens
  accessToken          String?  @db.Text
  refreshToken         String?  @db.Text
  expiresAt            DateTime?
  scope                String?
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  // Relations
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("auth_providers")
}

// Session Management
model Session {
  id                   String   @id @default(uuid())
  userId               String
  sessionToken         String   @unique
  refreshToken         String   @unique
  
  // Session metadata
  ipAddress            String?
  userAgent            String?
  deviceFingerprint    String?
  
  // Expiration
  accessTokenExpires   DateTime
  refreshTokenExpires  DateTime
  
  // Status
  isActive             Boolean  @default(true)
  revokedAt            DateTime?
  revokedReason        String?
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  lastActivityAt       DateTime @default(now())
  
  // Relations
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([sessionToken])
  @@index([refreshToken])
  @@index([isActive])
  @@map("sessions")
}

// Sign-in/Sign-up Activity Tracking
model SisuActivity {
  id                   String   @id @default(uuid())
  userId               String?
  email                String
  action               String   // 'signup', 'signin', 'signout', 'failed_signin', 'token_refresh', 'session_revoked'
  provider             String   // 'linkedin', 'google', etc.
  
  // Browser/Device Info
  ipAddress            String?
  userAgent            String?
  browser              String?
  browserVersion       String?
  os                   String?
  osVersion            String?
  device               String?
  deviceType           String?  // 'desktop', 'mobile', 'tablet'
  deviceFingerprint    String?
  
  // Location/Language Info
  country              String?
  city                 String?
  language             String?
  timezone             String?
  
  // Additional Context
  referer              String?
  success              Boolean  @default(true)
  errorMessage         String?
  sessionId            String?  // Our session ID
  
  createdAt            DateTime @default(now())
  
  // Relations
  user                 User?    @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([email])
  @@index([createdAt])
  @@index([action])
  @@map("sisu_activities")
}
```

### Authentication Flow - Custom Implementation

```
1. Sign In/Up Flow:
   ├─ User clicks "Sign in with [Provider]"
   ├─ Redirect to provider OAuth endpoint
   ├─ User authenticates with chosen provider
   ├─ Provider redirects to /api/auth/[provider]/callback
   ├─ In callback handler:
   │  ├─ Exchange code for tokens
   │  ├─ Get user info from provider
   │  ├─ Find or create user in our DB
   │  ├─ Create session & generate JWT tokens
   │  ├─ Store session in database
   │  ├─ Set secure httpOnly cookies
   │  ├─ Log SisuActivity
   │  └─ Check onboarding status
   └─ Redirect to portal or onboarding

2. Session Validation:
   ├─ Middleware checks JWT from cookie
   ├─ Validates token signature & expiry
   ├─ Check session is active in DB
   ├─ Auto-refresh if near expiry
   └─ Attach user to request context

3. Token Refresh Flow:
   ├─ Check if access token expired
   ├─ Validate refresh token
   ├─ Verify session is still active
   ├─ Generate new access token
   ├─ Update session last activity
   └─ Return new token in cookie

4. Sign Out Flow:
   ├─ Call /api/auth/logout
   ├─ Revoke session in database
   ├─ Clear auth cookies
   ├─ Log SisuActivity
   └─ Redirect to home

5. Token Revocation:
   ├─ Manual revocation by user
   ├─ Automatic on suspicious activity
   ├─ Bulk revocation for security
   └─ Clear all sessions option
```

## 3. Implementation Plan 📋

### Phase 1: JWT & Core Authentication Infrastructure (Week 1) ✅ COMPLETED

#### Task 1.1: JWT Token System Setup ✅
- [x] Generate secure JWT signing keys (RS256)
- [x] Configure token expiration times
- [x] Set up token validation utilities
- [x] Create refresh token mechanism

#### Task 1.2: Database Schema Updates ✅
- [x] Create migration for new tables (Session, AuthProvider, SisuActivity)
- [x] Update User model schema
- [x] Add indexes for performance
- [x] Run migrations

#### Task 1.3: Install & Configure Dependencies ✅
```typescript
// Install dependencies
- [x] npm install jose jsonwebtoken bcryptjs
- [x] npm install @types/jsonwebtoken @types/bcryptjs
- [x] npm install ua-parser-js geoip-lite
- [x] npm install nanoid (used instead of fingerprint-generator)

// lib/auth/jwt.ts
- [x] Create JWT signing/verification functions
- [x] Implement token generation with claims
- [x] Add token refresh logic

// lib/auth/session.ts
- [x] Create session management utilities
- [x] Implement session storage/retrieval
- [x] Add session revocation logic

// middleware.ts
- [x] Create authentication middleware
- [x] Protect /portal/* routes and APIs
- [x] Add token validation
- [x] Implement auto-refresh logic
```

#### Task 1.4: Environment Setup
```env
# .env.local
# JWT Configuration
JWT_SECRET='[generate with: openssl rand -hex 64]'
JWT_REFRESH_SECRET='[generate with: openssl rand -hex 64]'
JWT_ACCESS_TOKEN_EXPIRY='1h'
JWT_REFRESH_TOKEN_EXPIRY='1m'

# OAuth Providers
LINKEDIN_CLIENT_ID='your-linkedin-client-id'
LINKEDIN_CLIENT_SECRET='your-linkedin-client-secret'
GOOGLE_CLIENT_ID='your-google-client-id'
GOOGLE_CLIENT_SECRET='your-google-client-secret'

# Security
SESSION_COOKIE_NAME='automapost_session'
SESSION_COOKIE_SECURE='true' # false for development
SESSION_COOKIE_HTTPONLY='true'
SESSION_COOKIE_SAMESITE='lax'

# Application
NEXT_PUBLIC_APP_URL='http://localhost:3000'
```

### Phase 2: User Management & Activity Tracking (Week 1-2) ✅ COMPLETED

#### Task 2.1: OAuth Callback Handlers ✅
```typescript
// app/api/auth/[provider]/callback/route.ts
- [x] Create dynamic route handler for each provider
- [x] Exchange authorization code for tokens
- [x] Get user profile from provider
- [x] Create/update user in database
- [x] Generate JWT tokens
- [x] Create session record
- [x] Check onboarding status and redirect

// lib/auth/providers/config.ts
- [x] Implement OAuth provider configurations
- [x] Handle token exchange for LinkedIn & Google
- [x] Parse user profiles

```

#### Task 2.2: User Sync & Management ✅
```typescript
// lib/auth/user-sync.ts
- [x] Create/update user from provider profile
- [x] Map provider-specific fields
- [x] Handle email conflicts
- [x] Merge accounts with same email

// lib/auth/activity.ts
- [x] Create SisuActivity logging functions
- [x] Parse user-agent for device info
- [x] Add geo-location detection
- [x] Generate device fingerprint
```

#### Task 2.3: Session Management ✅
```typescript
// lib/auth/session.ts
- [x] Create new session function
- [x] Validate active sessions
- [x] Implement session revocation
- [x] Add concurrent session limits
- [x] Handle device management
```

### Phase 3: User Features & UI Integration (Week 2) ⚡ PARTIALLY COMPLETED

#### Task 3.1: Update Authentication UI ✅
```typescript
// app/[locale]/login/client.tsx
- [x] Updated sign-in page to use the new auth flow
- [x] Handle OAuth errors gracefully

// hooks/useAuth.tsx
- [x] Created useAuth hook for user data
- [x] Add sign out functionality
- [x] Show user profile info
- [ ] Display active sessions count (UI component needed)
```

#### Task 3.2: Protected Routes & Layouts
```typescript
// app/[locale]/(app)/layout.tsx
- [ ] Create protected layout wrapper
- [ ] Check JWT validity
- [ ] Handle token refresh
- [ ] Redirect to login if not authenticated

// components/auth/auth-guard.tsx
- [ ] Create AuthGuard component
- [ ] Show loading state during auth check
- [ ] Handle auth errors gracefully
```

#### Task 3.3: Update Existing Flows
```typescript
// app/[locale]/onboarding/page.tsx
- [ ] Update to use JWT user context
- [ ] Integrate with new session system

// hooks/useAuth.ts
- [ ] Create custom auth hook
- [ ] Handle user state
- [ ] Manage token refresh
- [ ] Provide logout function

// Update all API routes
- [ ] Use JWT validation middleware
- [ ] Extract user from token
- [ ] Check session validity
```

### Phase 4: Social Media Integration (Week 3)

#### Task 4.1: Social Provider Configuration
```typescript
// lib/auth/providers/config.ts
- [ ] Configure OAuth endpoints for each provider
- [ ] Set up redirect URIs
- [ ] Define required scopes per provider

// app/[locale]/portal/settings/social-accounts/page.tsx
- [ ] Create social accounts management page
- [ ] Allow connecting accounts for posting
- [ ] Show connected accounts status
- [ ] Handle account disconnection
```

#### Task 4.2: Token Management
```typescript
// lib/social/token-manager.ts
- [ ] Handle social media API tokens
- [ ] Implement provider-specific refresh logic
- [ ] Validate scopes for posting permissions
- [ ] Encrypt tokens before storage
```

### Phase 5: Security & Analytics (Week 3-4)

#### Task 5.2: Activity Monitoring
```typescript
// app/[locale]/portal/settings/security/page.tsx
- [ ] Show recent login activity
- [ ] Display active devices/sessions
- [ ] Allow session termination
```

## 4. Other


1. **Token Security**:
   - Use RS256 algorithm for JWT signing
   - Short-lived access tokens (15 minutes)
   - Secure refresh tokens (7 days, rotate on use)
   - Store tokens in httpOnly, secure cookies
   - Implement token blacklisting for revocation

2. **Session Security**:
   - Generate cryptographically secure session IDs
   - Implement session fixation protection
   - Add concurrent session limits
   - Device fingerprinting for anomaly detection
   - Automatic session timeout after inactivity

4. **Activity Monitoring**:
   - Log all authentication events
   - Track device and location changes
   - Failed loginfor monitoring

## 6. Next Steps 🚀

1. **Immediate Actions**:
   - Review and approve database schema
   - Set up JWT key generation
   - Create base authentication utilities

2. **First PR**:
   - Database migrations
   - JWT utilities
   - Updated middleware



## 7. Technical Implementation Details

### JWT Token Structure

#### Access Token
```json
{
  "iss": "https://automapost.com",
  "sub": "user_uuid",
  "aud": "https://api.automapost.com",
  "exp": 1234567890, // 15 minutes from iat
  "iat": 1234567890,
  "jti": "unique_token_id",
  "type": "access",
  "email": "user@example.com",
  "name": "User Name",
  "sessionId": "session_uuid"
}
```

#### Refresh Token
```json
{
  "iss": "https://automapost.com",
  "sub": "user_uuid",
  "aud": "https://api.automapost.com",
  "exp": 1234567890, // 7 days from iat
  "iat": 1234567890,
  "jti": "unique_refresh_token_id",
  "type": "refresh",
  "sessionId": "session_uuid",
  "tokenFamily": "family_id" // for refresh token rotation
}
```

### Cookie Configuration
```typescript
// Access Token Cookie
{
  name: 'automapost_access',
  value: 'jwt_token',
  httpOnly: true,
  secure: true, // in production
  sameSite: 'lax',
  maxAge: 900, // 15 minutes
  path: '/'
}

// Refresh Token Cookie
{
  name: 'automapost_refresh',
  value: 'refresh_jwt_token',
  httpOnly: true,
  secure: true, // in production
  sameSite: 'lax',
  maxAge: 604800, // 7 days
  path: '/api/auth/refresh'
}

// CSRF Token Cookie
{
  name: 'automapost_csrf',
  value: 'csrf_token',
  httpOnly: false, // readable by JS
  secure: true,
  sameSite: 'strict',
  maxAge: 900
}
```

### Environment Variables Needed
```env
# JWT Configuration
JWT_SECRET='[64+ character secret for HS256, or path to private key for RS256]'
JWT_PUBLIC_KEY='[path to public key for RS256]'
JWT_ALGORITHM='RS256'
JWT_ISSUER='https://automapost.com'
JWT_AUDIENCE='https://api.automapost.com'

# Token Expiry
ACCESS_TOKEN_EXPIRY='15m'
REFRESH_TOKEN_EXPIRY='7d'
REFRESH_TOKEN_ROTATION='true'

# Session Configuration
SESSION_IDLE_TIMEOUT='30m'
MAX_CONCURRENT_SESSIONS='5'

# OAuth Providers
LINKEDIN_CLIENT_ID='your-linkedin-client-id'
LINKEDIN_CLIENT_SECRET='your-linkedin-client-secret'
LINKEDIN_REDIRECT_URI='http://localhost:3000/api/auth/linkedin/callback'

GOOGLE_CLIENT_ID='your-google-client-id'
GOOGLE_CLIENT_SECRET='your-google-client-secret'
GOOGLE_REDIRECT_URI='http://localhost:3000/api/auth/google/callback'

# Security
BCRYPT_ROUNDS='12'
RATE_LIMIT_WINDOW='60000' # 1 minute in ms
RATE_LIMIT_MAX_REQUESTS='5'

# Database
DATABASE_URL='postgresql://...'

# Application
NEXT_PUBLIC_APP_URL='http://localhost:3000'
NODE_ENV='development'

# Analytics (optional)
IPINFO_TOKEN='your-token'
```

## 8. API Endpoints

### Authentication Endpoints
- `GET /api/auth/[provider]/login` - Initiate OAuth login
- `GET /api/auth/[provider]/callback` - OAuth callback handler
- `POST /api/auth/logout` - Sign out and revoke session
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user from JWT

### Session Management
- `GET /api/auth/sessions` - List active sessions
- `DELETE /api/auth/sessions/:id` - Revoke specific session
- `DELETE /api/auth/sessions` - Revoke all sessions
- `GET /api/auth/activity` - Get sign-in activity

### Account Management
- `GET /api/user/social-accounts` - List connected social accounts
- `POST /api/user/social-accounts` - Connect social account for posting
- `DELETE /api/user/social-accounts/:provider` - Disconnect social account

### Protected API Examples
```typescript
// app/api/user/profile/route.ts
import { validateToken } from '@/lib/auth/jwt'
import { getSession } from '@/lib/auth/session'

export async function GET(request: Request) {
  // Extract and validate JWT
  const token = await validateToken(request)
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Verify session is active
  const session = await getSession(token.sessionId)
  if (!session?.isActive) {
    return new Response('Session expired', { status: 401 })
  }
  
  // Get user data
  const user = await getUserById(token.sub)
  return Response.json(user)
}
```

## 9. Error Handling

### Error Codes
- `AUTH001`: Invalid or expired token
- `AUTH002`: Session not found
- `AUTH003`: Provider not configured
- `AUTH004`: OAuth state mismatch
- `AUTH005`: Failed to exchange code
- `AUTH006`: User not found
- `AUTH007`: Multiple accounts with same email
- `AUTH008`: Rate limit exceeded

### User-Friendly Messages
```typescript
const errorMessages = {
  AUTH001: "Your session has expired. Please sign in again.",
  AUTH002: "Session not found. Please sign in.",
  AUTH003: "This sign-in method is not available.",
  AUTH004: "Security check failed. Please try again.",
  AUTH005: "Failed to complete sign-in. Please try again.",
  AUTH006: "Account not found. Please sign up first.",
  AUTH007: "This email is already associated with another sign-in method.",
  AUTH008: "Too many attempts. Please try again later."
}
```

## 10. Monitoring & Analytics

### Key Metrics to Track
- Sign-in success rate by provider
- Average session duration
- Failed sign-in attempts
- Geographic distribution of users
- Device/browser usage
- Provider preference trends
- Security incidents
- Auth0 quota usage

### Dashboard Views
1. **Real-time Activity**: Current active sessions
2. **Security Alerts**: Suspicious sign-ins
3. **Provider Analytics**: Usage by provider
4. **User Insights**: Sign-in patterns
5. **Technical Metrics**: API performance

## 11. Custom Authentication Implementation Examples

### Middleware Configuration
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import { validateAccessToken } from './lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public routes
  const publicPaths = ['/', '/about', '/pricing', '/login', '/api/auth']
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Protected routes
  if (pathname.startsWith('/portal') || pathname.startsWith('/api')) {
    const token = await validateAccessToken(request)
    
    if (!token) {
      // Try to refresh token
      const refreshed = await attemptTokenRefresh(request)
      if (!refreshed) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
    
    // Add user context to headers
    const response = NextResponse.next()
    response.headers.set('X-User-Id', token.sub)
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### OAuth Callback Handler
```typescript
// app/api/auth/[provider]/callback/route.ts
import { NextResponse } from 'next/server'
import { exchangeCodeForTokens, getUserProfile } from '@/lib/auth/providers'
import { findOrCreateUser } from '@/lib/auth/user-sync'
import { createSession, generateTokens } from '@/lib/auth/session'
import { logActivity } from '@/lib/auth/activity'

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    // Validate state to prevent CSRF
    if (!validateState(state)) {
      throw new Error('Invalid state parameter')
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(params.provider, code)
    
    // Get user profile from provider
    const profile = await getUserProfile(params.provider, tokens.access_token)
    
    // Find or create user
    const { user, isNew } = await findOrCreateUser({
      provider: params.provider,
      providerAccountId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
      tokens
    })
    
    // Create session and generate JWT tokens
    const session = await createSession(user.id, request)
    const { accessToken, refreshToken } = await generateTokens(user, session)
    
    // Log activity
    await logActivity({
      userId: user.id,
      email: user.email,
      action: isNew ? 'signup' : 'signin',
      provider: params.provider,
      sessionId: session.id,
      // ... device info from request
    })
    
    // Set cookies and redirect
    const response = NextResponse.redirect(
      new URL(user.onboardingCompleted ? '/portal' : '/onboarding', request.url)
    )
    
    setAuthCookies(response, accessToken, refreshToken)
    
    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
```

### Client-Side Auth Hook
```typescript
// hooks/useAuth.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 401) {
        // Try to refresh token
        await refreshToken()
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }
  
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' })
      if (response.ok) {
        await checkAuth()
      } else {
        setUser(null)
      }
    } catch (err) {
      setError(err as Error)
      setUser(null)
    }
  }
  
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (err) {
      setError(err as Error)
    }
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

## 12. Benefits of Custom Implementation

### For Development
- **Full Control**: Complete ownership of authentication logic and user flow
- **Customization**: Tailor authentication to AutomaPost's specific needs
- **No Vendor Lock-in**: Freedom to modify and extend without limitations
- **Direct Database Access**: Immediate access to user data without API calls

### For Security
- **Data Sovereignty**: All authentication data stays in our infrastructure
- **Custom Security Rules**: Implement AutomaPost-specific security policies
- **Audit Trail**: Complete visibility into all authentication events
- **Flexible Token Management**: Custom token expiry and rotation strategies

### For Users
- **Seamless Experience**: Authentication integrated directly into the app
- **Faster Performance**: No external API calls for session validation
- **Custom Features**: Implement unique features like device management
- **Privacy**: User data never leaves our servers

### For Business
- **Cost Efficiency**: No per-user fees or subscription costs
- **Unlimited Scale**: No artificial limits on users or authentications
- **Custom Analytics**: Track exactly what matters to AutomaPost
- **Competitive Advantage**: Unique authentication features for differentiation

## 13. JWT Security Best Practices

### Token Security
1. **Use RS256 Algorithm**: Asymmetric signing prevents token tampering
2. **Short-Lived Access Tokens**: 15-minute expiry limits exposure window
3. **Secure Storage**: HttpOnly cookies prevent XSS attacks
4. **Token Rotation**: New refresh token on each use prevents replay attacks
5. **JTI Claims**: Unique token IDs enable revocation

### Implementation Guidelines
```typescript
// Token Generation Best Practices
const accessToken = {
  sub: userId,              // Subject (user ID)
  iat: Date.now() / 1000,   // Issued at
  exp: Date.now() / 1000 + 900, // Expires in 15 minutes
  jti: crypto.randomUUID(), // Unique token ID
  type: 'access',
  sessionId: sessionId      // Link to session for revocation
}

// Secure Cookie Settings
const cookieOptions = {
  httpOnly: true,           // Prevent JS access
  secure: true,             // HTTPS only
  sameSite: 'lax',         // CSRF protection
  path: '/',               // Accessible site-wide
  maxAge: 900              // 15 minutes
}
```

### Session Management Strategy
1. **Database Sessions**: Store active sessions for revocation capability
2. **Device Fingerprinting**: Detect session hijacking attempts
3. **Concurrent Limits**: Maximum 5 sessions per user
4. **Activity Tracking**: Update lastActivityAt on each request
5. **Automatic Cleanup**: Purge expired sessions daily

## 14. Migration Checklist

- [ ] Generate JWT signing keys (RS256 key pair)
- [ ] Update database schema with Session and SisuActivity tables
- [ ] Install authentication dependencies (jose, jsonwebtoken, etc.)
- [ ] Create JWT utilities for token generation/validation
- [ ] Implement session management system
- [ ] Build OAuth provider integrations (LinkedIn, Google)
- [ ] Update middleware for JWT-based route protection
- [ ] Create authentication API endpoints
- [ ] Build token refresh mechanism
- [ ] Implement activity tracking and logging
- [ ] Add security features (rate limiting, CSRF protection)
- [ ] Create session revocation system
- [ ] Update onboarding to use new auth system
- [ ] Build authentication UI components
- [ ] Test all authentication flows thoroughly
- [ ] Create monitoring dashboards
- [ ] Document API endpoints and flows
- [ ] Plan gradual rollout strategy
