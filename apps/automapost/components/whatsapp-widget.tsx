'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export default function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(false)
  const [shakeClass, setShakeClass] = useState('')
  const [cycleCount, setCycleCount] = useState(0)
  const [isNigerianUser, setIsNigerianUser] = useState(false)
  const pathname = usePathname()

  // Detect if user is from Nigeria using two methods
  useEffect(() => {
    const detectNigerianUser = () => {
      try {
        // Method 1: Language/Locale Detection
        const hasNigerianLocale = () => {
          // Check primary language
          const primaryLanguage = navigator.language
          if (primaryLanguage.endsWith('-NG')) {
            return true
          }
          
          // Check all preferred languages
          const languages = navigator.languages || []
          return languages.some(lang => lang.endsWith('-NG'))
        }

        // Method 2: Timezone Detection
        const hasNigerianTimezone = () => {
          try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            return timezone === 'Africa/Lagos'
          } catch (error) {
            console.warn('Timezone detection failed:', error)
            return false
          }
        }

        // User is considered Nigerian if either method returns true
        const isNigerian = hasNigerianLocale() || hasNigerianTimezone()
        setIsNigerianUser(isNigerian)

        // Log detection results for debugging (can be removed in production)
        if (process.env.NODE_ENV === 'development') {
          console.log('Location Detection Results:', {
            primaryLanguage: navigator.language,
            allLanguages: navigator.languages,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hasNigerianLocale: hasNigerianLocale(),
            hasNigerianTimezone: hasNigerianTimezone(),
            isNigerianUser: isNigerian
          })
        }
      } catch (error) {
        console.warn('Location detection failed:', error)
        // Default to showing widget if detection fails
        setIsNigerianUser(false)
      }
    }

    detectNigerianUser()
  }, [])

  // Rotating tooltip messages
  const tooltipMessages = [
    "Any questions? Chat with us.",
    "Missing a feature? Let me know.",
    "Need a custom plan? Let's talk.",
    "Want a quick demo? Say hi.",
    "Stuck? Get answers here."
  ]

  // Get current message based on cycle count
  const currentMessage = tooltipMessages[cycleCount % tooltipMessages.length]

  useEffect(() => {
    const startCycle = () => {
      // Calculate delay: 5s, 10s, 15s, 20s, etc.
      const delay = (cycleCount + 1) * 5000

      const timer = setTimeout(() => {
        // Start shake animation
        setShakeClass('animate-shake')
        
        // Show tooltip after shake starts
        setShowTooltip(true)
        
        // Hide tooltip after 6 seconds
        setTimeout(() => {
          setShowTooltip(false)
          setShakeClass('')
          setCycleCount(prev => prev + 1)
        }, 6000)
        
      }, delay)

      return timer
    }

    const timer = startCycle()
    return () => clearTimeout(timer)
  }, [cycleCount])

  const handleWhatsAppClick = () => {
    // Track WhatsApp button click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_whatsapp_click', {
        event_category: 'User Interaction',
        event_label: 'WhatsApp Chat Widget',
        value: 1
      })
    }

    const phoneNumber = '353894945879'
    const message = encodeURIComponent('Hi! I have a question about AutomaPost.')
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  // Don't render the widget for Nigerian users
  if (isNigerianUser) {
    return null
  }

  // Don't render the widget on portal pages
  if (pathname && pathname.includes('/portal') || pathname.includes('/onboarding') || pathname.includes('/login')) {
    return null
  }

  // Don't render for now
  return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
            {currentMessage}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
        
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className={`w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer ${shakeClass}`}
          aria-label="Chat with us on WhatsApp"
        >
          {/* WhatsApp Logo SVG */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 text-white"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
          </svg>
        </button>
      </div>
    </div>
  )
}