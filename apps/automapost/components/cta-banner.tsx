'use client'

import { ArrowRight, Clock, Star } from 'lucide-react'
import { useLocale } from 'next-intl'

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

interface CTABannerProps {
  title: string
  subtitle: string
  ctaText: string
  urgency?: string
  variant?: 'primary' | 'secondary'
}

export default function CTABanner({ 
  title, 
  subtitle, 
  ctaText, 
  urgency,
  variant = 'primary' 
}: CTABannerProps) {
  const locale = useLocale()

  return (
    <section data-section="final_cta" className="py-16 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className={`text-center max-w-5xl mx-auto rounded-2xl py-16 px-12 ${variant === 'primary' ? 'text-white' : 'text-neutral-dark'}`} style={{backgroundColor: variant === 'primary' ? '#213130' : 'transparent'}}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${variant === 'primary' ? 'text-white' : 'text-neutral-dark'}`}>
            {title}
          </h2>
          <p className={`text-lg mb-6 ${variant === 'primary' ? 'text-white' : 'text-neutral-gray'}`}>
            {subtitle}
          </p>
          
          {urgency && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className={`text-sm font-semibold ${variant === 'primary' ? 'text-white' : 'text-neutral-dark'}`}>
                {urgency}
              </span>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className={`btn btn-lg ${
                variant === 'primary'
                  ? 'btn-primary'
                  : 'btn-primary'
              }`}
              onClick={() => {
                // Track button click event
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'button_get_started_click', {
                    event_category: 'User Interaction',
                    event_label: ctaText,
                    value: 1
                  })
                }
                // Redirect to signup
                if (typeof window !== 'undefined') {
                  window.location.href = `/${locale}/signup`
                }
              }}
            >
              {ctaText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="flex items-center" role="img" aria-label="4.8 out of 5 stars rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <span className={variant === 'primary' ? 'text-white' : 'text-neutral-gray'}>
                  4.8/5 rating
                </span>
              </div>
              <span className={variant === 'primary' ? 'text-white' : 'text-neutral-gray'}>
                •
              </span>
              <span className={variant === 'primary' ? 'text-white' : 'text-neutral-gray'}>
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 