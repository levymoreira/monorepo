'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Shield, Zap, BarChart3, Calendar, Users, Brain, Sparkles, Database, Cpu, PenTool, X, Plus, Info } from 'lucide-react'
import Lottie from 'lottie-react'
import { useTranslations } from 'next-intl'

// Visual Left Panel Component with Process Animations
function VisualPanel({ step }: { step: string }) {
  const t = useTranslations('onboarding.visual')
  const isStep1 = step === '1'
  const [linkedinAnimation, setLinkedinAnimation] = useState<any>(null)
  const [dataAnimation, setDataAnimation] = useState<any>(null)

  useEffect(() => {
    // Load Lottie animations dynamically
    if (isStep1) {
      fetch('/linkedin-animation.json')
        .then(response => response.json())
        .then(data => setLinkedinAnimation(data))
        .catch(error => console.error('Error loading LinkedIn animation:', error))
    } else {
      // Load user-data animation JSON
      fetch('/user-data-animation.json')
        .then(response => response.json())
        .then(data => setDataAnimation(data))
        .catch(error => console.error('Error loading user-data animation:', error))
    }
  }, [isStep1])
  
  return (
    <div className="hidden lg:block relative w-full lg:w-[70%] h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-gray-50 to-gray-100">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-8 lg:px-16">
        {isStep1 ? (
          <>
            {/* Step 1: LinkedIn Connection */}
            <div className="w-full max-w-2xl text-center space-y-12">
              {/* Header */}
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 border border-blue-100">
                  <div className="w-2 h-2 bg-[#0078D4] rounded-full mr-2 animate-pulse"></div>
                  {t('step1Badge')}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {t('step1TitleLine1')}{' '}
                  <span className="block bg-gradient-to-r from-[#0078D4] to-cyan-600 bg-clip-text text-transparent mt-2">
                    {t('step1TitleHighlight')}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl mx-auto">{t('step1Subtitle')}</p>
              </div>

              {/* LinkedIn Animation */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm">
                  {linkedinAnimation ? (
                    <Lottie 
                      animationData={linkedinAnimation} 
                      loop={true}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-[#0078D4] rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Data Collection & Preferences */}
            <div className="w-full max-w-2xl text-center space-y-12">
              {/* Header */}
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-purple-50 rounded-full text-sm font-medium text-purple-700 border border-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                  {t('step2Badge')}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {t('step2TitleLine1')}
                  <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                    {t('step2TitleHighlight')}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl mx-auto">{t('step2Subtitle')}</p>
              </div>

              {/* Data Animation */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm">
                  {dataAnimation ? (
                    <Lottie 
                      animationData={dataAnimation} 
                      loop={true}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Step 1: LinkedIn Connect Component
function LinkedInConnect() {
  const t = useTranslations('onboarding.connect')
  const params = useParams()
  const locale = params.locale as string
  
  const handleLinkedInConnect = () => {
    // Track LinkedIn connect button click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_linkedin_connect_click', {
        event_category: 'Onboarding',
        event_label: 'Continue with LinkedIn',
        value: 1
      })
    }
    // Redirect to new auth endpoint with onboarding as the redirect target
    window.location.href = `/api/auth/linkedin/login?redirectTo=${encodeURIComponent(`/${locale}/onboarding?step=2`)}`
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center space-y-8">
          {/* LinkedIn Icon */}
          <div className="space-y-6">
            <div className="w-20 h-20 bg-[#0078D4] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h2>
              <p className="text-gray-600">{t('subtitle')}</p>
            </div>
          </div>

          {/* Connect Button */}
          <Button 
            onClick={handleLinkedInConnect}
            className="w-full bg-[#0078D4] hover:bg-[#106EBE] text-white h-12 rounded-lg font-medium transition-all duration-200 hover:shadow-lg cursor-pointer"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {t('button')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
            <Shield className="w-3 h-3" />
            <span>{t('securityNote')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 2: User Preferences Component
function UserQuestions() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('onboarding.form')
  const [formData, setFormData] = useState({
    role: '',
    interests: [] as string[],
    maxCommentsPerDay: 5,
    maxLikesPerDay: 10
  })
  const [currentInterest, setCurrentInterest] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addInterest = () => {
    if (currentInterest.trim() && !formData.interests.includes(currentInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, currentInterest.trim()] })
      setCurrentInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData({ 
      ...formData, 
      interests: formData.interests.filter(i => i !== interest) 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate minimum interests
    if (formData.interests.length < 3) {
      setError(t('errorMinInterests') || 'Please add at least 3 interests to continue')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to portal/posts after successful onboarding
        router.push(`/${locale}/portal/posts`)
      } else {
        setError(data.error || t('errorGeneric'))
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setError(t('errorNetwork'))
    } finally {
      setIsLoading(false)
    }
  }

  const isFormComplete = formData.role.trim() !== '' && formData.interests.length >= 3

  return (
    <div className="w-full min-h-screen flex items-start justify-center p-4 sm:p-8 pt-8 sm:pt-8 bg-white overflow-y-auto">
      <style jsx>{`
        .interests-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .interests-scrollbar::-webkit-scrollbar-track {
          background: #E6F2FC;
          border-radius: 3px;
        }
        .interests-scrollbar::-webkit-scrollbar-thumb {
          background: #0078D4;
          border-radius: 3px;
        }
        .interests-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #106EBE;
        }
      `}</style>
      <div className="w-full max-w-md">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('headerTitle')}</h2>
              <p className="text-gray-600">{t('headerSubtitle')}</p>
            </div>
            
            {/* Note */}
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{t('note')}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Role Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('labels.role')}</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder={t('labels.rolePlaceholder')}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus-visible:outline-none focus:outline-0 focus:outline-offset-0 focus:ring-2 focus:ring-[#0078D4] focus:border-transparent transition-all bg-white"
                required
              />
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{t('labels.interests')}</label>
                <span className={`text-xs ${formData.interests.length >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.interests.length}/3 {t('labels.interestsMinimum') || 'minimum'}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInterest}
                  onChange={(e) => setCurrentInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  placeholder={t('labels.interestsPlaceholder')}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus-visible:outline-none focus:outline-0 focus:outline-offset-0 focus:ring-2 focus:ring-[#0078D4] focus:border-transparent transition-all bg-white"
                />
                <Button
                  type="button"
                  onClick={addInterest}
                  className="h-[50px] w-[50px] bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg transition-all flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Interest Tags */}
              {formData.interests.length > 0 && (
                <div 
                  className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto p-1 interests-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#0078D4 #E6F2FC'
                  }}
                >
                  {formData.interests.map((interest, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm h-fit"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-Comment Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700">{t('engagementSettings')}</h3>
              
              {/* Max Comments */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">{t('maxComments')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={formData.maxCommentsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxCommentsPerDay: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium text-gray-900">{formData.maxCommentsPerDay}</span>
                </div>
              </div>

              {/* Max Likes */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">{t('maxLikes')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={formData.maxLikesPerDay}
                    onChange={(e) => setFormData({ ...formData, maxLikesPerDay: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium text-gray-900">{formData.maxLikesPerDay}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={!isFormComplete || isLoading}
              className={`w-full h-12 rounded-lg font-medium transition-all duration-200 ${
                isFormComplete 
                  ? 'bg-gradient-to-r from-[#0078D4] to-[#106EBE] hover:from-[#106EBE] hover:to-[#005A9E] text-white hover:shadow-lg cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>{t('submitting')}</span>
                </div>
              ) : (
                <>
                  {t('submit')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Progress */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="w-12 h-0.5 bg-green-500"></div>
            <div className={`w-2 h-2 rounded-full ${isFormComplete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="ml-3 text-xs text-gray-500">{t('finalStep')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Onboarding Content
function OnboardingContent() {
  const searchParams = useSearchParams()
  const step = searchParams.get('step') || '1'

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel - Visual Explanation (70% on desktop) */}
      <VisualPanel step={step} />
      
      {/* Right Panel - Action Step (30% on desktop, full on mobile) */}
      <div className="w-full lg:w-[30%] lg:shadow-xl min-h-screen lg:h-screen overflow-y-auto">
        {step === '2' ? <UserQuestions /> : <LinkedInConnect />}
      </div>
    </div>
  )
}

// Main Export - Client Component
function OnboardingPageClient() {
  const t = useTranslations('onboarding')
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0078D4] rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">{t('loading')}</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}

export default OnboardingPageClient