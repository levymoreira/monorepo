import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth/jwt'
import { validateSession } from '@/lib/auth/session'
import { clearAuthCookies } from '@/lib/auth/cookies'


export async function POST(request: NextRequest) {
  try {
    // JWT-based authentication only
    let userId: string | null = null

    const token = extractTokenFromRequest(request as unknown as Request)
    if (token) {
      const payload = await verifyAccessToken(token)
      if (payload) {
        // Ensure session is active
        const isValid = await validateSession(payload.sessionId)
        if (isValid) {
          userId = payload.sub
        }
      }
    }

    if (!userId) {
      const response = NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
      return clearAuthCookies(response);
    }

    const body = await request.json()
    const { role, interests, maxCommentsPerDay, maxLikesPerDay } = body

    // Validate required fields
    if (!role || !interests || !Array.isArray(interests) || interests.length < 3) {
      return NextResponse.json({ error: 'Role and at least 3 interests are required' }, { status: 400 })
    }

    // Update user with onboarding data
    await db.update(users)
      .set({
        role,
        interests,
        maxCommentsPerDay: maxCommentsPerDay || 5,
        maxLikesPerDay: maxLikesPerDay || 10,
        onboardingCompleted: true,
      })
      .where(eq(users.id, userId))

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      redirectUrl: '/portal/posts'
    })

  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}