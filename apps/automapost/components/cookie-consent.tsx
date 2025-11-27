'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface ConsentPreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  performance: boolean
  advertisement: boolean
  others: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Essential cookies always enabled
    functional: false,
    analytics: false,
    performance: false,
    advertisement: false,
    others: false,
  })

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      // Apply stored consent preferences
      const stored = JSON.parse(consent)
      setPreferences(stored)
      updateGoogleConsent(stored)
    }
  }, [])

  // Handle Escape key to close preferences modal
  useEffect(() => {
    if (showPreferences) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setShowPreferences(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [showPreferences])

  const updateGoogleConsent = (prefs: ConsentPreferences) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: (prefs.analytics || prefs.performance) ? 'granted' : 'denied',
        ad_storage: prefs.advertisement ? 'granted' : 'denied',
        ad_user_data: prefs.advertisement ? 'granted' : 'denied',
        ad_personalization: prefs.advertisement ? 'granted' : 'denied',
        functionality_storage: prefs.functional ? 'granted' : 'denied',
        security_storage: 'granted', // Always granted for security
      })
    }
  }

  const handleAcceptAll = () => {
    // Track button click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_cookies_click', {
        event_category: 'Cookie Consent',
        event_label: 'Accept All',
        value: 1
      })
    }

    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      performance: true,
      advertisement: true,
      others: true,
    }
    
    setPreferences(allAccepted)
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    updateGoogleConsent(allAccepted)
    setShowBanner(false)
    setShowPreferences(false)
  }

  const handleRejectAll = () => {
    // Track button click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_cookies_click', {
        event_category: 'Cookie Consent',
        event_label: 'Reject All',
        value: 1
      })
    }

    const onlyEssential = {
      necessary: true,
      functional: false,
      analytics: false,
      performance: false,
      advertisement: false,
      others: false,
    }
    
    setPreferences(onlyEssential)
    localStorage.setItem('cookie-consent', JSON.stringify(onlyEssential))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    updateGoogleConsent(onlyEssential)
    setShowBanner(false)
    setShowPreferences(false)
  }

  const handleSavePreferences = () => {
    // Track button click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_cookies_click', {
        event_category: 'Cookie Consent',
        event_label: 'Save',
        value: 1
      })
    }

    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    updateGoogleConsent(preferences)
    setShowBanner(false)
    setShowPreferences(false)
  }

  const handlePreferenceChange = (type: keyof ConsentPreferences, value: boolean) => {
    if (type === 'necessary') return // Necessary cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Main Banner - Small Popup */}
      {!showPreferences && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-[440px] h-[200px] max-w-[calc(100vw-2rem)]">
          <div className="p-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookie consent</h3>
              <p className="text-gray-600 text-sm leading-snug mb-4">
                This website uses cookies that help the website to function and also to track how you interact with our website. But for us to provide the best user experience, enable the specific cookies from Settings, and click on Accept.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  // Track button click event
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'button_cookies_click', {
                      event_category: 'Cookie Consent',
                      event_label: 'Preferences',
                      value: 1
                    })
                  }
                  setShowPreferences(true)
                }}
                className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:scale-[1.02] focus:outline-none focus:border-[#213130] transition-all duration-200 font-medium text-sm cursor-pointer"
              >
                Preferences
              </button>
              <button
                onClick={handleRejectAll}
                className="px-3 py-2 rounded-md hover:scale-[1.02] focus:outline-none transition-all duration-200 font-medium text-sm cursor-pointer"
                style={{
                  color: '#717375',
                  borderColor: 'transparent',
                  backgroundColor: '#E0E0E0'
                }}
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-3 py-2 rounded-md hover:bg-[rgb(155,231,132)] hover:border-[rgb(155,231,132)] hover:scale-[1.02] focus:outline-none focus:border-[#213130] transition-all duration-200 font-medium text-sm cursor-pointer"
                style={{
                  backgroundColor: 'rgb(176, 236, 156)',
                  color: '#1F2937',
                  border: '1px solid rgb(176, 236, 156)'
                }}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preferences-title"
          aria-describedby="preferences-description"
          onClick={() => setShowPreferences(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 id="preferences-title" className="text-xl font-semibold text-gray-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:border-[#213130] border border-transparent rounded-md transition-colors cursor-pointer"
                aria-label="Close privacy preferences"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                <div id="preferences-description" className="text-sm text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website.
                  </p>
                  <p>
                    We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies. But opting out of some of these cookies may have an effect on your browsing experience.
                  </p>
                </div>

                {/* Cookie Categories */}
                <div className="space-y-4">
                  {/* Necessary */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-medium text-gray-900">Necessary</span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Always Active</span>
                    </div>
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      <p className="mb-2">Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.</p>
                      <p>These cookies do not store any personally identifiable data.</p>
                    </div>
                  </div>

                  {/* Functional */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span id="functional-label" className="font-medium text-gray-900">Functional</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                          className="sr-only peer"
                          aria-labelledby="analytics-label"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="sr-only">Toggle analytics cookies</span>
                      </label>
                    </div>
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span id="analytics-label" className="font-medium text-gray-900">Analytics</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span id="performance-label" className="font-medium text-gray-900">Performance</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.performance}
                          onChange={(e) => handlePreferenceChange('performance', e.target.checked)}
                          className="sr-only peer"
                          aria-labelledby="performance-label"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="sr-only">Toggle performance cookies</span>
                      </label>
                    </div>
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.
                    </div>
                  </div>

                  {/* Advertisement */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span id="advertisement-label" className="font-medium text-gray-900">Advertisement</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.advertisement}
                          onChange={(e) => handlePreferenceChange('advertisement', e.target.checked)}
                          className="sr-only peer"
                          aria-labelledby="advertisement-label"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="sr-only">Toggle advertisement cookies</span>
                      </label>
                    </div>
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.
                    </div>
                  </div>

                  {/* Others */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span id="others-label" className="font-medium text-gray-900">Others</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.others}
                          onChange={(e) => handlePreferenceChange('others', e.target.checked)}
                          className="sr-only peer"
                          aria-labelledby="others-label"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="sr-only">Toggle other cookies</span>
                      </label>
                    </div>
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 border border-gray-200 rounded-md hover:bg-gray-300 hover:scale-[1.02] focus:outline-none focus:border-[#213130] transition-all duration-200 font-medium cursor-pointer"
              >
                Reject All
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:scale-[1.02] focus:outline-none focus:border-[#213130] transition-all duration-200 font-medium cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-6 py-3 rounded-md hover:bg-[rgb(155,231,132)] hover:border-[rgb(155,231,132)] hover:scale-[1.02] focus:outline-none focus:border-[#213130] transition-all duration-200 font-medium cursor-pointer"
                style={{
                  backgroundColor: 'rgb(176, 236, 156)',
                  color: '#1F2937',
                  border: '1px solid rgb(176, 236, 156)'
                }}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
