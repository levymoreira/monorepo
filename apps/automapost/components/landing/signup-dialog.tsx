'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle, Star, Users } from 'lucide-react'

interface SignupDialogProps {
  onClose: () => void
  signupName: string
  setSignupName: (name: string) => void
  signupEmail: string
  setSignupEmail: (email: string) => void
  hasSignedUp: boolean
  onSubmit: (source: 'dialog' | 'hero') => Promise<void>
}

export default function SignupDialog({
  onClose,
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
  hasSignedUp,
  onSubmit
}: SignupDialogProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [dialogErrors, setDialogErrors] = useState<{ name?: string; email?: string }>({})
  const [hasInitialFocus, setHasInitialFocus] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogView, setDialogView] = useState<'form' | 'success'>('form')
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  const isValidEmail = (value: string) => {
    const trimmed = value.trim()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  }

  useEffect(() => {
    // Lock background scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    // Close on escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const handleSubmit = async () => {
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
      setDialogErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit('dialog')
      
      // Track successful submission
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'dialog_signup_success', {
          event_category: 'Lead Generation',
          event_label: 'Dialog Signup Complete',
          value: 1
        })
      }
      
      // Redirect to onboarding after successful submission
      setIsSubmitting(false)
      onClose() // Close dialog first
      
      // Redirect after a brief delay to ensure dialog closes
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/${locale}/onboarding`
        }
      }, 100)
      
    } catch (error) {
      console.error('Signup error:', error)
      setIsSubmitting(false)
      setDialogErrors({ email: 'Something went wrong. Please try again.' })
    }
  }

  const dialogContent = (
    <div 
      className="fixed inset-0 flex items-start sm:items-center justify-center p-4" 
      aria-modal="true" 
      role="dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative z-10 w-full max-w-3xl lg:max-w-4xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {dialogView === 'form' ? (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <h3 id="dialog-title" className="text-xl font-semibold text-neutral-dark">{t('dialog.title')}</h3>
                  <p id="dialog-description" className="text-sm text-neutral-gray">{t('dialog.description')}</p>
                </div>
                <button
                  aria-label="Close"
                  className="p-2 -m-2 text-neutral-gray hover:text-neutral-dark cursor-pointer"
                  onClick={onClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Info column */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center py-1.5 bg-accent/10 rounded-full text-xs font-semibold text-neutral-dark">
                      {t('dialog.joinedMessage')}
                    </div>
                    <ul className="space-y-3">
                      {t.raw('dialog.benefits').map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-neutral-dark">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center text-sm text-neutral-gray">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" aria-hidden="true" />
                      <span>{t('dialog.rating')}</span>
                    </div>
                  </div>

                  {/* Form column */}
                  <div className="bg-neutral-light rounded-xl px-4 sm:px-5 py-0">
                    <div className="space-y-3">
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
                      <div className="space-y-1">
                        <label className="text-sm text-neutral-dark" htmlFor="ea-name">{t('dialog.nameLabel')}</label>
                        <input
                          id="ea-name"
                          ref={nameInputRef}
                          type="text"
                          placeholder={t('dialog.namePlaceholder')}
                          className={`input w-full ${dialogErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                          required
                          value={signupName}
                          onFocus={() => {
                            if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'input_username_focus', {
                                event_category: 'User Interaction',
                                event_label: 'Dialog Username Input',
                                value: 1
                              })
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value
                            setSignupName(value)
                            if (dialogErrors.name && value.trim()) {
                              setDialogErrors((prev) => ({ ...prev, name: undefined }))
                            }
                          }}
                        />
                        {dialogErrors.name && (
                          <p className="text-xs text-red-600 mt-1">{dialogErrors.name}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-neutral-dark" htmlFor="ea-email">{t('dialog.emailLabel')}</label>
                        <input
                          id="ea-email"
                          type="email"
                          placeholder={t('dialog.emailPlaceholder')}
                          className={`input w-full ${dialogErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                          required
                          value={signupEmail}
                          onFocus={() => {
                            if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'input_email_focus', {
                                event_category: 'User Interaction',
                                event_label: 'Dialog Email Input',
                                value: 1
                              })
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value
                            setSignupEmail(value)
                            if (dialogErrors.email && isValidEmail(value)) {
                              setDialogErrors((prev) => ({ ...prev, email: undefined }))
                            }
                          }}
                        />
                        {dialogErrors.email && (
                          <p className="text-xs text-red-600 mt-1">{dialogErrors.email}</p>
                        )}
                      </div>
                      <button
                        className="btn btn-primary w-full btn-lg get-started"
                        disabled={isSubmitting}
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.gtag) {
                            window.gtag('event', 'button_signup_click', {
                              event_category: 'User Interaction',
                              event_label: 'Dialog Sign Up Now',
                              value: 1
                            })
                          }
                          handleSubmit()
                        }}
                      >
                        {isSubmitting ? t('hero.signingUp') : t('dialog.signUpButton')}
                      </button>
                      <p className="text-xs text-neutral-gray text-center">{t('dialog.agreementText')}</p>
                      </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-semibold text-neutral-dark">Thanks for your interest</h3>
                  <p className="text-sm text-neutral-gray">We're currently onboarding at full capacity.</p>
                </div>
                <button
                  aria-label="Close"
                  className="p-2 -m-2 text-neutral-gray hover:text-neutral-dark cursor-pointer"
                  onClick={onClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="p-8 sm:p-10">
                <div className="max-w-xl mx-auto text-center space-y-5">
                  <div className="mx-auto w-14 h-14 rounded-full bg-accent/15 ring-1 ring-accent/30 flex items-center justify-center">
                    <Users className="w-7 h-7 text-neutral-dark" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-neutral-dark">We'll be in touch soon</h3>
                  <p className="text-neutral-gray">
                    Thanks for signing up. As we scale up and open more seats, we'll reach out with access. In the meantime, please keep an eye on your inbox.
                  </p>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-light text-neutral-dark text-sm font-medium border border-gray-200">
                      {signupEmail || 'your email'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <button className="btn btn-outline" onClick={onClose}>Close</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Early return after all hooks have been called
  if (typeof window === 'undefined') return null
  
  // Get or create portal container once
  let portalContainer = document.getElementById('dialog-portal')
  if (!portalContainer) {
    portalContainer = document.createElement('div')
    portalContainer.id = 'dialog-portal'
    portalContainer.style.position = 'relative'
    portalContainer.style.zIndex = '2147483647'
    document.body.appendChild(portalContainer)
  }

  return createPortal(dialogContent, portalContainer)
}

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}