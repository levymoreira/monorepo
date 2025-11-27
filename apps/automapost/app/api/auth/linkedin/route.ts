import { NextRequest, NextResponse } from 'next/server'

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`

export async function GET(request: NextRequest) {
  try {
    if (!LINKEDIN_CLIENT_ID) {
      return NextResponse.json({ error: 'LinkedIn OAuth not configured' }, { status: 500 })
    }

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Store state in session/cookie for verification later
    const response = NextResponse.redirect(
      `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=openid profile email`
    )

    // Set state cookie for verification
    response.cookies.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    return response
  } catch (error) {
    console.error('LinkedIn OAuth initiation error:', error)
    return NextResponse.json({ error: 'Failed to initiate LinkedIn OAuth' }, { status: 500 })
  }
}