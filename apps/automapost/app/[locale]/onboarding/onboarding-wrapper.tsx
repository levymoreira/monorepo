import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { verifyAccessToken } from '@/lib/auth/jwt'

interface OnboardingWrapperProps {
  step: string
  locale: string
  searchParams?: { [key: string]: string | string[] | undefined }
  children: React.ReactNode
}

export async function OnboardingWrapper({ step, locale, searchParams, children }: OnboardingWrapperProps) {
  const cookieStore = await cookies()
  
  // Use JWT-based auth system only
  const accessToken = cookieStore.get('automapost_access')?.value
  let userId: string | null = null
  
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (payload) {
      userId = payload.sub
    }
  }

  // If user is not authenticated, redirect to signup
  if (!userId) {
    redirect(`/${locale}/signup`)
  }

  // User is authenticated, check their status
  try {
    const userResults = await db.select({
      onboardingCompleted: users.onboardingCompleted,
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    const user = userResults[0]

    if (!user) {
      // User not found – redirect to signup
      redirect(`/${locale}/signup`)
    }

    // If onboarding already completed, go to portal
    if (user.onboardingCompleted) {
      redirect(`/${locale}/portal/posts`)
    }

    // All checks passed, render children (always show step 2 - preferences form)
    return <>{children}</>
  } catch (error: any) {
    // Allow Next.js redirect exceptions to bubble without logging as errors
    const digest = error?.digest as string | undefined
    if (digest && typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Error checking user status (non-redirect):', error)
    // On non-redirect error, let them proceed
    return <>{children}</>
  }
}
