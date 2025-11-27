'use client'

import { useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, X, Plus, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

// User Preferences Component
function UserPreferences() {
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
        </div>
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
      <UserPreferences />
    </Suspense>
  )
}

export default OnboardingPageClient