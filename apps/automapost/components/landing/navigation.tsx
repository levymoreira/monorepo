'use client'

import { useState } from 'react'
import { Menu, X, Globe } from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations('navigation')
  const locale = useLocale()
  
  // Helper function to handle analytics safely
  const trackEvent = (eventName: string, category: string, label: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: category,
        event_label: label,
        value: 1
      })
    }
  }
  
  // Helper function to dispatch custom events safely
  const dispatchEvent = (eventName: string, detail?: any) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, detail ? { detail } : undefined))
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href={`/${locale}`} 
              aria-label="AutomaPost home" 
              className="inline-flex items-center"
              onClick={() => trackEvent('link_click', 'Navigation', 'Home Logo')}
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="36" viewBox="0 0 160 36" className="h-9">
              <style>
                {`
                text {
                  font-family: 'Figtree', sans-serif;
                  font-weight: 700;
                }`}
              </style>

              {/* New logo from second SVG, scaled and positioned */}
              <g transform="translate(0, -2) scale(0.4)">
                <g>
                  <path d="M70,57c-4.8,0-8.9,3.4-9.8,8H47c-0.6,0-1,0.5-1,1.1c0,0.3,0,0.6,0,0.9c0,1-0.1,1.9-0.3,2.8
                    c-0.1,0.6,0.4,1.2,1,1.2h14.1c1.5,3.5,5.1,6,9.2,6c5.5,0,10-4.5,10-10C80,61.5,75.5,57,70,57z" fill="#213130"/>
                </g>
                <g>
                  <path d="M43.3,45.5c-1.2-0.5-2.3-1.2-3.3-2c-0.5-0.4-1.2-0.2-1.5,0.3l-7.1,13.3C31,57,30.5,57,30,57
                    c-5.5,0-10,4.5-10,10c0,5.5,4.5,10,10,10c5.5,0,10-4.5,10-10c0-2.9-1.2-5.4-3.1-7.3l6.9-12.8C44,46.4,43.8,45.8,43.3,45.5z" fill="#213130"/>
                </g>
                <g>
                  <path d="M50,41c1,0,1.9-0.1,2.8-0.4l6.9,12.7c0.3,0.5,0.9,0.7,1.4,0.4c1.1-0.7,2.2-1.3,3.4-1.7
                    c0.6-0.2,0.8-0.9,0.5-1.4l-7.2-13.4c1.3-1.7,2.2-3.9,2.2-6.2c0-5.5-4.5-10-10-10s-10,4.5-10,10C40,36.5,44.5,41,50,41z" fill="#213130"/>
                </g>
              </g>

              {/* Text */}
              <text x="40" y="24" fontSize="20" fill="#213130">
                AutomaPost
              </text>
            </svg>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/${locale}#features`} 
              className="text-neutral-dark hover:text-primary transition-colors"
              onClick={() => trackEvent('link_click', 'Navigation', 'Features')}
            >
              {t('features')}
            </Link>
            <Link 
              href={`/${locale}#pricing`} 
              className="text-neutral-dark hover:text-primary transition-colors"
              onClick={() => trackEvent('link_click', 'Navigation', 'Pricing')}
            >
              {t('pricing')}
            </Link>
            <Link 
              href={`/${locale}#faq`} 
              className="text-neutral-dark hover:text-primary transition-colors"
              onClick={() => trackEvent('link_click', 'Navigation', 'FAQ')}
            >
              {t('faq')}
            </Link>
            
            <button
              className="btn btn-outline"
              onClick={() => {
                trackEvent('button_signin_click', 'User Interaction', 'Desktop Sign In')
                window.location.href = `/${locale}/login`
              }}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                trackEvent('button_get_started_click', 'User Interaction', 'Desktop Get Started Free')
                dispatchEvent('focus-signup', { scroll: true })
              }}
            >
              {t('getStarted')}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-neutral-dark" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-dark" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden py-4 border-t border-gray-200"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col space-y-4">
              <Link 
                href={`/${locale}#features`} 
                className="text-neutral-dark hover:text-primary transition-colors"
                onClick={() => {
                  trackEvent('link_click', 'Mobile Navigation', 'Features')
                  setIsMenuOpen(false)
                }}
              >
                {t('features')}
              </Link>
              <Link 
                href={`/${locale}#pricing`} 
                className="text-neutral-dark hover:text-primary transition-colors"
                onClick={() => {
                  trackEvent('link_click', 'Mobile Navigation', 'Pricing')
                  setIsMenuOpen(false)
                }}
              >
                {t('pricing')}
              </Link>
              <Link 
                href={`/${locale}#faq`} 
                className="text-neutral-dark hover:text-primary transition-colors"
                onClick={() => {
                  trackEvent('link_click', 'Mobile Navigation', 'FAQ')
                  setIsMenuOpen(false)
                }}
              >
                {t('faq')}
              </Link>
              
              <button
                className="btn btn-outline w-full"
                onClick={() => {
                  trackEvent('button_signin_click', 'User Interaction', 'Mobile Sign In')
                  window.location.href = `/${locale}/login`
                  setIsMenuOpen(false)
                }}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  trackEvent('button_get_started_click', 'User Interaction', 'Mobile Get Started Free')
                  dispatchEvent('focus-signup', { scroll: true })
                  setIsMenuOpen(false)
                }}
              >
                {t('getStarted')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}