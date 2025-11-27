import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db as prisma } from '@/lib/db'
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

  // If user is not authenticated, they can proceed with step 1 (never show error=invalid_state)
  if (!userId) {
    // If trying to access step 2 without auth, restart at step 1 without preserving error query
    if (step === '2') {
      redirect(`/${locale}/onboarding?step=1`)
    }
    return <>{children}</>
  }

  // User is authenticated, check their status
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        linkedinId: true,
        onboardingCompleted: true,
        authProviders: {
          select: { id: true, provider: true }
        }
      }
    })

    if (!user) {
      // User not found – redirect user to start onboarding step without modifying cookies here
      redirect(`/${locale}/onboarding?step=1`)
    }

    // Check if user has LinkedIn connected (either old or new system)
    const hasLinkedIn = Boolean(
      user.linkedinId || user.authProviders.some(p => (p.provider || '').toLowerCase() === 'linkedin')
    )

    console.log('[OnboardingWrapper] user status', {
      userId,
      linkedinId: !!user.linkedinId,
      providers: user.authProviders,
      hasLinkedIn
    })

    // Check if force parameter is set to bypass auto-redirects
    const forceStep = searchParams?.force === 'true' || searchParams?.force === '1'
    
    // Check onboarding status based on current step
    if (step === '1') {
      // User is on step 1
      if (hasLinkedIn && !forceStep) {
        // LinkedIn already connected, go to step 2 (unless force is set)
        redirect(`/${locale}/onboarding?step=2`)
      }
    } else if (step === '2') {
      // User is on step 2
      if (!hasLinkedIn) {
        // No LinkedIn connection, go back to step 1
        redirect(`/${locale}/onboarding?step=1`)
      } else if (user.onboardingCompleted) {
        // Onboarding already completed, go to portal
        redirect(`/${locale}/portal/posts`)
      }
    }

    // All checks passed, render children
    return <>{children}</>
  } catch (error: any) {
    // Allow Next.js redirect exceptions to bubble without logging as errors
    const digest = error?.digest as string | undefined
    if (digest && typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Error checking user status (non-redirect):', error)
    // On non-redirect error, let them proceed with current step
    return <>{children}</>
  }
}
