'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import dynamic from 'next/dynamic'

// Lazy load the dialog to reduce initial bundle
const SignupDialog = dynamic(() => import('./signup-dialog'), { 
  ssr: false,
  loading: () => null
})


export default function HeroInteractive() {
  const t = useTranslations()
  const locale = useLocale()
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [heroErrors, setHeroErrors] = useState<{ name?: string; email?: string }>({})
  const [hasSignedUp, setHasSignedUp] = useState(false)
  const [animateAttention, setAnimateAttention] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const formContainerRef = useRef<HTMLDivElement | null>(null)

  const isValidEmail = (value: string) => {
    const trimmed = value.trim()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  }

  const handleSignupSubmit = useCallback(async (source: 'dialog' | 'hero') => {
    const trimmedName = signupName.trim()
    const trimmedEmail = signupEmail.trim()

    const nextErrors: { name?: string; email?: string } = {}
    if (!trimmedName) {
      nextErrors.name = t('validation.nameRequired')
    }
    if (!trimmedEmail) {
      nextErrors.email = t('validation.emailRequired')
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = t('validation.emailInvalid')
    }

    if (nextErrors.name || nextErrors.email) {
      if (source === 'hero') {
        setHeroErrors(nextErrors)
        setAnimateAttention(true)
        setTimeout(() => setAnimateAttention(false), 600)
      }
      return
    }

    setIsSubmitting(true)

    try {
      const referer = typeof window !== 'undefined' ? document.referrer || 'direct' : 'direct'
      const collectionPlace = source === 'dialog' ? 'landing_page_dialog' : 'landing_page'

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          referer: referer,
          collectionPlace: collectionPlace
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          const errorMessage = t('validation.emailExists')
          if (source === 'hero') {
            setHeroErrors({ email: errorMessage })
          }
          return
        } else {
          throw new Error(data.error || 'Failed to submit')
        }
      }

      try {
        localStorage.setItem('earlyAccessName', trimmedName)
        localStorage.setItem('earlyAccessEmail', trimmedEmail)
        localStorage.setItem('earlyAccessSubmitted', 'true')
      } catch {}

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'lead_submitted', {
          event_category: 'Lead Generation',
          event_label: collectionPlace,
          value: 1
        })
      }

      if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
        (window as any).gtag_report_conversion()
      }

      setSignupName('')
      setSignupEmail('')
      setHeroErrors({})
      
      if (source === 'hero') {
        // Redirect to onboarding for hero form submission
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = `/${locale}/onboarding`
          }
        }, 100)
      } else {
        // For dialog, just show success (handled by dialog component)
        setHasSignedUp(true)
      }

    } catch (error) {
      console.error('Error submitting lead:', error)
      const errorMessage = t('validation.genericError')
      if (source === 'hero') {
        setHeroErrors({ email: errorMessage })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [signupName, signupEmail, t])

  const handleGetStarted = useCallback(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_get_started_click', {
        event_category: 'User Interaction',
        event_label: 'Get Started Free',
        value: 1
      })
    }
    if (typeof window !== 'undefined') {
      window.location.href = `/${locale}/signup`
    }
  }, [locale])

  // Listen for focus-signup events from other components to open dialog
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ scroll?: boolean }>
      if (ce.detail?.scroll) {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {}
      }
      setShowDialog(true)
    }
    window.addEventListener('focus-signup', handler as EventListener)
    return () => {
      window.removeEventListener('focus-signup', handler as EventListener)
    }
  }, [])


  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <button
          className="btn btn-primary btn-xl"
          onClick={handleGetStarted}
        >
          {t('hero.ctaPrimary')}
        </button>
        <div className="block sm:inline">
          <br className="block sm:hidden" />
          <span className="text-lg text-neutral-gray"> - {t('hero.ctaSubtext')}</span>
        </div>
        <br />
      </div>
      
      <div
        ref={formContainerRef}
        className={`bg-white rounded-lg p-4 shadow-lg ${animateAttention ? 'attention-animate' : ''}`}
      >
        {hasSignedUp ? (
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800">{t('hero.alreadySignedUp.title')}</h3>
              <div className="space-y-2 text-green-700">
                <p className="text-sm">{t('hero.alreadySignedUp.description')}</p>
                <p className="text-sm font-medium">{t('hero.alreadySignedUp.subtitle')}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-gray mb-3">{t('hero.formSubtext')}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('hero.namePlaceholder')}
                  className={`input flex-1 w-full ${heroErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  value={signupName}
                  onFocus={() => {
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'input_username_focus', {
                        event_category: 'User Interaction',
                        event_label: 'Hero Username Input',
                        value: 1
                      })
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value
                    setSignupName(value)
                    if (heroErrors.name && value.trim()) {
                      setHeroErrors((prev) => ({ ...prev, name: undefined }))
                    }
                  }}
                />
                {heroErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{heroErrors.name}</p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder={t('hero.emailPlaceholder')}
                  className={`input flex-1 w-full ${heroErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  value={signupEmail}
                  onFocus={() => {
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'input_email_focus', {
                        event_category: 'User Interaction',
                        event_label: 'Hero Email Input',
                        value: 1
                      })
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value
                    setSignupEmail(value)
                    if (heroErrors.email && isValidEmail(value)) {
                      setHeroErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                />
                {heroErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{heroErrors.email}</p>
                )}
              </div>
              <button
                className="btn btn-primary w-full sm:w-auto h-9 flex-shrink-0 get-started"
                disabled={isSubmitting}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'button_signup_click', {
                      event_category: 'User Interaction',
                      event_label: 'Hero Sign Up',
                      value: 1
                    })
                  }
                  if (typeof window !== 'undefined') {
                    window.location.href = `/${locale}/signup`
                  }
                }}
              >
                {t('hero.signUpButton')}
              </button>
            </div>
          </>
        )}
      </div>

      {showDialog && (
        <SignupDialog 
          onClose={() => setShowDialog(false)}
          signupName={signupName}
          setSignupName={setSignupName}
          signupEmail={signupEmail}
          setSignupEmail={setSignupEmail}
          hasSignedUp={hasSignedUp}
          onSubmit={handleSignupSubmit}
        />
      )}
    </div>
  )
}

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}