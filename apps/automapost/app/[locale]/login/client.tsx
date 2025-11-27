'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPageClient() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'session_expired') {
      setErrorMessage('Your session has expired. Please sign in again.')
    } else if (error === 'auth_error') {
      setErrorMessage('Authentication failed. Please try again.')
    }
  }, [searchParams])

  const handleLinkedInSignIn = async () => {
    try {
      setLoading(true)
      
      // Track button click
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'button_linkedin_signin_click', {
          event_category: 'User Interaction',
          event_label: 'Sign In with LinkedIn',
          value: 1
        })
      }

      // Get redirect URL from query params or default
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('from') || `/${locale}/portal`

      // Redirect to LinkedIn OAuth using new auth endpoint (without locale prefix)
      window.location.href = `/api/auth/linkedin/login?redirectTo=${encodeURIComponent(redirectTo)}`
    } catch (error) {
      console.error('Error during sign in:', error)
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push(`/${locale}`)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center space-y-8">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          
          {/* LinkedIn Icon */}
          <div className="space-y-6">
            <div className="w-20 h-20 bg-[#0078D4] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your LinkedIn</h2>
              <p className="text-gray-600">We'll use your professional profile to create AI-powered content that sounds like you.</p>
            </div>
          </div>

          {/* Connect Button */}
          <Button 
            onClick={handleLinkedInSignIn}
            disabled={loading}
            className="w-full bg-[#0078D4] hover:bg-[#106EBE] text-white h-12 rounded-lg font-medium transition-all duration-200 hover:shadow-lg cursor-pointer"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continue with LinkedIn
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
            <span>Secured with OAuth 2.0 • We never store passwords</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
