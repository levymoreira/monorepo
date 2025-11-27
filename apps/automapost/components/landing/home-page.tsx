'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { 
  CheckCircle, 
  Calendar, 
  BarChart3, 
  Zap, 
  Users, 
  Star,
  ArrowRight,
  Play,
  Shield,
  Clock,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Stats from '@/components/stats'
import { FadeInUp, ScaleIn, RotateInOnScroll } from '@/components/scroll-animations'
import CTABanner from '@/components/cta-banner'
import FloatingLogos from '@/components/floating-logos'
import SignupDialog from './signup-dialog'

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

// FAQ Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleFAQ = () => {
    const newState = !isOpen
    
    // Track FAQ click event only when expanding (opening)
    if (!isOpen && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_faq_click', {
        event_category: 'User Interaction',
        event_label: question,
        value: 1
      })
    }
    
    setIsOpen(newState)
  }

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-6 text-left focus:outline-none hover:bg-gray-50 transition-colors cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={toggleFAQ}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="text-lg font-semibold text-neutral-dark pr-4">{question}</span>
        <span className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary" />
          )}
        </span>
      </button>
      {isOpen && (
        <div 
          className="pb-6 fade-in"
          id={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <p className="text-neutral-gray leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

// Testimonial Component
function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary/20 hover:-translate-y-2 overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Quote icon */}
      <div className="relative mb-6">
        <svg className="w-12 h-12 text-primary/20 group-hover:text-primary/40 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
        </svg>
      </div>
      
      {/* Rating stars */}
      <div className="flex items-center mb-6 relative">
        <div className="flex items-center" role="img" aria-label={`${testimonial.rating} out of 5 stars rating`}>
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current mr-1 transform group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 100}ms`}} aria-hidden="true" />
          ))}
        </div>
        <span className="ml-2 text-sm font-medium text-neutral-gray">{testimonial.rating}.0</span>
      </div>
      
      {/* Quote text */}
      <blockquote className="text-lg leading-relaxed text-neutral-dark mb-8 relative">
        <span className="text-2xl text-primary font-serif absolute -top-2 -left-1">"</span>
        <span className="relative z-10">{testimonial.quote}</span>
        <span className="text-2xl text-primary font-serif absolute -bottom-6 right-0">"</span>
      </blockquote>
      
      {/* Author section */}
      <div className="flex items-center relative">
        {/* Avatar with enhanced styling */}
        <div className="relative">
          <img 
            src={testimonial.image} 
            alt={`Profile photo of ${testimonial.author}, ${testimonial.role} at ${testimonial.company}`}
            className="w-16 h-16 rounded-full object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300 border-2 border-white"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300 hidden">
            {testimonial.author.split(' ').map((n: string) => n[0]).join('')}
          </div>
          {/* Verified badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neutral-dark ring-2 ring-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="font-bold text-neutral-dark text-lg group-hover:text-primary transition-colors duration-300">{testimonial.author}</div>
          <div className="text-neutral-gray font-medium">{testimonial.role}</div>
          <div className="text-sm text-neutral-gray/80">{testimonial.company}</div>
        </div>
        
        {/* LinkedIn icon */}
        <div className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ feature }: { feature: any }) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">
        {feature.icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-neutral-dark">{feature.title}</h3>
      <p className="text-neutral-gray mb-4">{feature.description}</p>
    </div>
  )
}

// Pricing Card Component
function PricingCard({ plan, onCtaClick }: { plan: any; onCtaClick?: () => void }) {
  const tCommon = useTranslations('common')
  
  return (
    <div className={`card relative ${plan.popular ? 'ring-2 ring-accent' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
            {tCommon('mostPopular')}
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-dark mb-2">{plan.name}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold text-neutral-dark">{plan.price}</span>
          <span className="text-neutral-gray">/{plan.period}</span>
        </div>
        <p className="text-neutral-gray">{plan.description}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
            <span className="text-neutral-dark">{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`} onClick={onCtaClick}>
        {plan.cta}
      </button>
    </div>
  )
}

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isPostHovered, setIsPostHovered] = useState(false)
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [heroErrors, setHeroErrors] = useState<{ name?: string; email?: string }>({})
  const [hasSignedUp, setHasSignedUp] = useState(false)
  const [animateAttention, setAnimateAttention] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [visibleSections, setVisibleSections] = useState(new Set<string>())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formContainerRef = useRef<HTMLDivElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  // Features Data
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-accent" />,
      title: t('features.items.0.title'),
      description: t('features.items.0.description')
    },
    {
      icon: <Calendar className="w-8 h-8 text-accent" />,
      title: t('features.items.1.title'),
      description: t('features.items.1.description')
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-accent" />,
      title: t('features.items.2.title'),
      description: t('features.items.2.description')
    }
  ]

  // Testimonials Data
  const testimonials = t.raw('testimonials.items')

  // FAQ Data
  const faqs = t.raw('faq.items')

  // Pricing Data
  const pricingPlans = t.raw('pricing.plans')

  const isValidEmail = (value: string) => {
    const trimmed = value.trim()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  }

  const handleSignupSubmit = async (source: 'dialog' | 'hero') => {
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
      // Dialog errors are now handled inside SignupDialog component
      return
    }

    // Start loading state
    setIsSubmitting(true)

    try {
      // Get referer information
      const referer = typeof window !== 'undefined' ? document.referrer || 'direct' : 'direct'
      
      // Determine collection place
      const collectionPlace = source === 'dialog' ? 'landing_page_dialog' : 'landing_page'

      // Call the API to save the lead
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
        // Handle API errors
        if (response.status === 409) {
          // Email already exists
          const errorMessage = t('validation.emailExists')
          if (source === 'hero') {
            setHeroErrors({ email: errorMessage })
          }
          // Dialog errors are now handled inside SignupDialog component
          return
        } else {
          throw new Error(data.error || 'Failed to submit')
        }
      }

      // Success - also save to localStorage for backup
      try {
        localStorage.setItem('earlyAccessName', trimmedName)
        localStorage.setItem('earlyAccessEmail', trimmedEmail)
        localStorage.setItem('earlyAccessSubmitted', 'true')
      } catch {}

      // Track successful submission
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'lead_submitted', {
          event_category: 'Lead Generation',
          event_label: collectionPlace,
          value: 1
        })
      }

      // Track conversion for Google Ads
      if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
        (window as any).gtag_report_conversion()
      }

      // Clear and mark submitted so forms no longer show
      setSignupName('')
      setSignupEmail('')
      setHeroErrors({})
      setHasSignedUp(true)

    } catch (error) {
      console.error('Error submitting lead:', error)
      
      // Show generic error message
      const errorMessage = t('validation.genericError')
      if (source === 'hero') {
        setHeroErrors({ email: errorMessage })
      }
      // Dialog errors are now handled inside SignupDialog component
    } finally {
      setIsSubmitting(false)
    }
  }

  const focusSignupForm = (options?: { scroll?: boolean }) => {
    const shouldScroll = options?.scroll ?? false
    if (shouldScroll) {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {
        // ignore
      }
    }
    const openDelayMs = shouldScroll ? 250 : 0
    setTimeout(() => {
      setShowDialog(true)
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 50)
    }, openDelayMs)
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ scroll?: boolean }>
      focusSignupForm({ scroll: ce.detail?.scroll })
    }
    window.addEventListener('focus-signup', handler as EventListener)
    return () => {
      window.removeEventListener('focus-signup', handler as EventListener)
    }
  }, [])

  // Lock background scroll and close on Escape when dialog is open
  useEffect(() => {
    if (showDialog) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowDialog(false)
      }
      window.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = prev
        window.removeEventListener('keydown', onKey)
      }
    }
  }, [showDialog])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Scroll tracking for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section')
          if (!sectionId) return

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Track when section becomes visible (more than 50% visible)
            if (!visibleSections.has(sectionId)) {
              setVisibleSections(prev => new Set([...prev, sectionId]))
              
              // Send Google Analytics event
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'scroll_to_section', {
                  event_category: 'User Engagement',
                  event_label: sectionId,
                  section_name: sectionId,
                  value: 1
                })
              }
            }
          }
        })
      },
      {
        threshold: [0.5], // Trigger when 50% of the section is visible
        rootMargin: '0px'
      }
    )

    // Observe all sections with data-section attributes
    const sections = document.querySelectorAll('[data-section]')
    sections.forEach(section => observer.observe(section))

    return () => {
      sections.forEach(section => observer.unobserve(section))
    }
  }, [visibleSections])

  return (
    <main id="main-content">
      {/* Section 1: Hero */}
      <section data-section="hero" className="section min-h-screen flex items-center hero-grid-bg pt-24 sm:pt-16 pb-8 relative overflow-hidden">
        {/* Signup Dialog */}
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
        <div className="hidden lg:block absolute inset-0 z-10">
          <FloatingLogos isPostHovered={isPostHovered} />
        </div>
        <div className="container relative z-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <FadeInUp className="space-y-8">
              <div className="space-y-4 mt-8 sm:mt-0 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                  {t('hero.title')} {' '}
                  <span className="gradient-text">{t('hero.titleHighlight')}</span> {t('hero.titleSuffix')}
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl text-neutral-gray font-normal">
                  {t('hero.subtitle')}
                </h2>
                <p className="text-base sm:text-lg text-neutral-gray">
                  {t('hero.description')}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="text-center sm:text-left">
                  <button
                    className="btn btn-primary btn-xl"
                    onClick={() => {
                      // Track button click event
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'button_get_started_click', {
                          event_category: 'User Interaction',
                          event_label: 'Get Started Free',
                          value: 1
                        })
                      }
                      // Open dialog instead of redirecting
                      setShowDialog(true)
                    }}
                  >
                    {t('hero.ctaPrimary')}
                  </button>
                  <div className="block sm:inline">
                    <br className="block sm:hidden" />
                    <span className="text-lg text-neutral-gray"> - {t('hero.ctaSubtext')}</span>
                  </div>
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
                            // Track button click event
                            if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'button_signup_click', {
                                event_category: 'User Interaction',
                                event_label: 'Hero Sign Up',
                                value: 1
                              })
                            }
                            handleSignupSubmit('hero')
                          }}
                        >
                          {isSubmitting ? t('hero.signingUp') : t('hero.signUpButton')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </FadeInUp>
            
            <ScaleIn className="relative mt-8 lg:mt-0">
              {/* Mobile version with scroll-triggered rotation */}
              <div className="block lg:hidden">
                <RotateInOnScroll initialRotation={3} finalRotation={0} threshold={0.3}>
                  <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="bg-gradient-to-r from-primary to-accent rounded-lg mb-4">
                  <div className="flex items-center space-x-3 text-neutral-dark">
                    <img src="/linkedin-user1.png" alt={`Profile photo of ${t('hero.linkedinPost.author')}, ${t('hero.linkedinPost.role')}`} className="w-11 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold">{t('hero.linkedinPost.author')}</div>
                      <div className="text-sm opacity-90">{t('hero.linkedinPost.role')}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  asdfadfa
                  <p className="text-neutral-dark">
                    aa {t('hero.linkedinPost.content1')}
                  </p>
                  <p className="text-neutral-dark whitespace-pre-line">
                    {t('hero.linkedinPost.content2')}
                  </p>
                  <p className="text-neutral-dark">
                    {t('hero.linkedinPost.content3')}
                  </p>
                    <div className="flex items-center justify-between text-sm text-neutral-gray">
                      <span>{t('hero.linkedinPost.hashtags')}</span>
                      <span>{t('hero.linkedinPost.timeAgo')}</span>
                    </div>
                  </div>
                  </div>
                </RotateInOnScroll>
              </div>
              
              {/* Desktop version with hover rotation */}
              <div className="hidden lg:block">
                <div 
                  className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300"
                  onMouseEnter={() => setIsPostHovered(true)}
                  onMouseLeave={() => setIsPostHovered(false)}
                >
                  <div className="bg-gradient-to-r from-primary to-accent rounded-lg mb-4">
                    <div className="flex items-center space-x-3 text-neutral-dark">
                      <img src="/linkedin-user1.png" alt={`Profile photo of ${t('hero.linkedinPost.author')}, ${t('hero.linkedinPost.role')}`} className="w-11 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold">{t('hero.linkedinPost.author')}</div>
                        <div className="text-sm opacity-90">{t('hero.linkedinPost.role')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-neutral-dark">
                      {t('hero.linkedinPost.content1')}
                    </p>
                    <p className="text-neutral-dark whitespace-pre-line">
                      {t('hero.linkedinPost.content2')}
                    </p>
                    <p className="text-neutral-dark">
                      {t('hero.linkedinPost.content3')}
                    </p>
                    <div className="flex items-center justify-between text-sm text-neutral-gray">
                      <span>{t('hero.linkedinPost.hashtags')}</span>
                      <span>{t('hero.linkedinPost.timeAgo')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* Section 2: Problem/Solution */}
      <section data-section="problem_solution" className="section-alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark">
                {t('problem.title')}
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-neutral-dark">
                  {t('problem.description')}
                </p>
                
                <div className="space-y-3">
                  {t.raw('problem.problems').map((problem: string, index: number) => (
                    <div key={index} className="flex items-center text-neutral-dark">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span>{problem}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark">
                {t('solution.title')}
              </h2>
              <p className="text-lg text-neutral-dark">
                {t('solution.description')}
              </p>
              
              <div className="space-y-4">
                {t.raw('solution.benefits').map((benefit: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-neutral-dark">{benefit.title}</h3>
                      <p className="text-neutral-gray">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features */}
      <section id="features" data-section="features" className="section" aria-labelledby="features-heading">
        <div className="container">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-neutral-gray max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section data-section="how_it_works" className="section-alt relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full text-sm font-medium text-primary mb-6">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              {t('howItWorks.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
              {t('howItWorks.title')}
              <span className="text-primary"> {t('howItWorks.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-neutral-gray max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {t.raw('howItWorks.steps').map((step: any, index: number) => (
              <div key={index} className="group relative h-full">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/20 relative h-full flex flex-col">
                  {/* Step number with gradient background */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold shadow-xl border-primary z-10">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />}
                      {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
                      {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-neutral-dark mb-4 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-neutral-gray leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Feature highlights */}
                  <div className="mt-6 space-y-2">
                    {step.features.map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-center text-sm text-neutral-gray">
                        <svg className="w-4 h-4 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Connection lines between steps */}
          <div className="hidden lg:block relative">
            <div className="absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-primary/30 to-accent/30 transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-2/3 w-1/3 h-0.5 bg-gradient-to-r from-accent/30 to-primary/30 transform -translate-y-1/2"></div>
          </div>
          
          <div className="text-center">
            <button
              className="btn btn-primary btn-xl group relative overflow-hidden"
              onClick={() => {
                // Track button click event
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'button_get_started_click', {
                    event_category: 'User Interaction',
                    event_label: 'Try It Free Now',
                    value: 1
                  })
                }
                // Open dialog instead of redirecting
                setShowDialog(true)
              }}
            >
              <span className="relative z-10">{t('howItWorks.cta')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-sm text-neutral-gray mt-4">{t('howItWorks.ctaSubtext')}</p>
          </div>
        </div>
      </section>

      {/* Section 5: Social Proof */}
      <section id="reviews" data-section="social_proof" className="section relative overflow-hidden" aria-labelledby="reviews-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>
        <div className="absolute top-20 -left-40 w-80 h-80 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-gradient-to-l from-accent/5 to-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full text-sm font-medium text-primary mb-6">
              <svg className="w-4 h-4 mr-2 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t('testimonials.badge')}
            </div>
            
            <h2 id="reviews-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
              {t('testimonials.title')} <span className="gradient-text">{t('testimonials.titleHighlight')}</span> {t('testimonials.titleSuffix')}
            </h2>
            <p className="text-xl text-neutral-gray max-w-2xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>
          
          {/* Enhanced grid layout with staggered animation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="transform" style={{animationDelay: `${index * 200}ms`}}>
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
          
          {/* Enhanced trust badges */}
          <div className="text-center space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {t.raw('testimonials.trustBadges').map((badge: any, index: number) => (
                <div key={index} className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="">
                      <div className="font-semibold text-neutral-dark">{badge.title}</div>
                      <div className="text-sm text-neutral-gray">{badge.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Pricing */}
      <section id="pricing" data-section="pricing" className="section-alt" aria-labelledby="pricing-heading">
        <div className="container">
          <div className="text-center mb-16">
            <h2 id="pricing-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-neutral-dark">
              {t('pricing.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {pricingPlans.map((plan: any, index: number) => (
              <PricingCard
                key={index}
                plan={plan}
                onCtaClick={() => {
                  // Track plan button click event
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'button_plan_click', {
                      event_category: 'User Interaction',
                      event_label: plan.name,
                      value: 1
                    })
                  }
                  // Open dialog instead of redirecting
                  setShowDialog(true)
                }}
              />
            ))}
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-lg text-neutral-dark">
              {t('pricing.additionalInfo')}
            </p>
            <div className="bg-accent/10 rounded-lg p-4 inline-block">
              <p className="text-accent font-semibold">{t('pricing.guarantee')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: FAQ */}
      <section id="faq" data-section="faq" className="section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-4">
                {t('faq.title')}
              </h2>
              <p className="text-xl text-neutral-gray">
                {t('faq.subtitle')}
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq: any, index: number) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CTABanner
        title={t('cta.title')}
        subtitle={t('cta.subtitle')}
        ctaText={t('cta.button')}
        urgency={t('cta.urgency')}
        variant="primary"
      />
    </main>
  )
}