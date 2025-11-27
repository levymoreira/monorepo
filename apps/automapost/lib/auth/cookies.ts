import { NextResponse } from 'next/server';

interface SetAuthCookiesOptions {
  accessToken: string;
  refreshToken: string;
  response: NextResponse;
}

export function setAuthCookies({ accessToken, refreshToken, response }: SetAuthCookiesOptions) {
  // Set access token cookie
  response.cookies.set('automapost_access', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600, // 1 hour
    path: '/'
  });
  
  // Set refresh token cookie
  response.cookies.set('automapost_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2592000, // 30 days
    path: '/api/auth/refresh'
  });
  
  return response;
}

// Clear HTTP-only cookies by setting them with expired dates
export function clearAuthCookies(response: NextResponse) {
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

// Get auth cookies from request
export function getAuthCookies(request: Request) {
  const cookies = request.headers.get('cookie');
  if (!cookies) return { accessToken: null, refreshToken: null };
  
  const accessMatch = cookies.match(/automapost_access=([^;]+)/);
  const refreshMatch = cookies.match(/automapost_refresh=([^;]+)/);
  
  return {
    accessToken: accessMatch ? accessMatch[1] : null,
    refreshToken: refreshMatch ? refreshMatch[1] : null
  };
}
