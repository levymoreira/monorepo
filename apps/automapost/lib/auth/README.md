# AutomaPost Authentication System

## Overview

This is a custom JWT-based authentication system with OAuth support for LinkedIn and Google.

## Quick Start

### Environment Variables

First, ensure you have the following environment variables set in `.env.local`:

```env
# JWT Keys (generate with scripts/generate-jwt-keys.js)
JWT_PRIVATE_KEY_PATH="/path/to/keys/private.key"
JWT_PUBLIC_KEY_PATH="/path/to/keys/public.key"

# OAuth Providers
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/auth/linkedin/callback"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

### Generate JWT Keys

```bash
node scripts/generate-jwt-keys.js
```

### Client-Side Usage

```tsx
// In your root layout or _app.tsx
import { AuthProvider } from '@/hooks/useAuth'

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

// In components
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, login, logout } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  if (!user) {
    return <button onClick={() => login('linkedin')}>Login with LinkedIn</button>
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### API Routes

#### Authentication Endpoints

- `GET /api/auth/[provider]/login` - Initiate OAuth login
- `GET /api/auth/[provider]/callback` - OAuth callback (handled automatically)
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

#### Protected API Example

```ts
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // User info is added by middleware
  const userId = request.headers.get('X-User-Id')
  const userEmail = request.headers.get('X-User-Email')
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your protected logic here
  return NextResponse.json({ message: `Hello ${userEmail}!` })
}
```

## Architecture

### Token Flow

1. User initiates OAuth login
2. OAuth provider redirects back with code
3. We exchange code for provider tokens
4. Create/update user in database
5. Generate JWT access token (1 hour) and refresh token (30 days)
6. Set tokens as httpOnly cookies
7. Middleware validates tokens on protected routes
8. Auto-refresh when access token expires

### Security Features

- RSA-256 signed JWTs
- HttpOnly secure cookies
- CSRF protection via state parameter
- Session fingerprinting
- Concurrent session limits (5 per user)
- Activity logging with geo-location
- Automatic session cleanup

### Database Schema

- **User**: Core user information
- **AuthProvider**: OAuth provider tokens
- **Session**: Active sessions with device info
- **SisuActivity**: Authentication activity log

## Development

### Adding a New OAuth Provider

1. Add provider config to `lib/auth/providers/config.ts`
2. Update the profile parsing in `getUserProfile()`
3. Add environment variables
4. Update the login UI

### Testing

```bash
# Test OAuth flow
curl http://localhost:3000/api/auth/linkedin/login

# Test current user
curl http://localhost:3000/api/auth/me \
  -H "Cookie: automapost_access=YOUR_TOKEN"

# Test logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: automapost_access=YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

1. **"Failed to load JWT private key"**
   - Run `node scripts/generate-jwt-keys.js`
   - Check JWT_PRIVATE_KEY_PATH in .env.local

2. **OAuth redirect mismatch**
   - Ensure redirect URIs match exactly in provider console
   - Check environment variables

3. **Session expired errors**
   - Tokens auto-refresh, but check if refresh token is valid
   - May need to login again after 30 days

### Debug Mode

Set `DEBUG=auth:*` to see detailed logs:

```bash
DEBUG=auth:* npm run dev
```
