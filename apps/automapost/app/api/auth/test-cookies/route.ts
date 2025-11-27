import { NextRequest, NextResponse } from 'next/server';
import { getCookieConfig } from '@/lib/auth/cookie-config';

export async function GET(request: NextRequest) {
  // List all cookies
  const cookies = request.cookies.getAll();
  
  // Set a test cookie
  const response = NextResponse.json({
    cookies: cookies.map(c => ({ name: c.name, value: c.value })),
    cookieConfig: getCookieConfig(600)
  });
  
  // Set a test cookie to verify settings work
  response.cookies.set('test_cookie', 'test_value', getCookieConfig(600));
  
  return response;
}

export async function POST(request: NextRequest) {
  // Clear specific OAuth cookies
  const provider = request.nextUrl.searchParams.get('provider') || 'linkedin';
  
  const response = NextResponse.json({ 
    message: 'OAuth cookies cleared',
    provider 
  });
  
  response.cookies.delete(`oauth_state_${provider}`);
  response.cookies.delete('oauth_redirect');
  
  return response;
}
