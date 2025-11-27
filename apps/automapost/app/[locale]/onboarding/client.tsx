'use client'

import { useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, X, Plus, Info, CheckCircle2, Sparkles } from 'lucide-react'
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

  const suggestedInterests = [
    "Technology", "Marketing", "Startups", "AI", "Leadership", "Design", "SaaS", "Productivity"
  ]

  const addInterest = (interest?: string) => {
    const valueToAdd = interest || currentInterest
    if (valueToAdd.trim() && !formData.interests.includes(valueToAdd.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, valueToAdd.trim()] })
      if (!interest) setCurrentInterest('')
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
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gray-50/50">
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
        input[type=range] {
          height: 6px;
          -webkit-appearance: none;
          background: transparent;
          width: 100%;
          cursor: pointer;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          background: #E2E8F0;
          border-radius: 3px;
        }
        input[type=range]::-webkit-slider-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #0078D4;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -7px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
      
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-gray-100 overflow-hidden border border-gray-100">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100">
          <div className="h-full bg-blue-600 w-2/3 rounded-r-full" />
        </div>

        <div className="p-8 sm:p-10">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('headerTitle')}</h2>
                <p className="text-gray-600 max-w-md mx-auto">{t('headerSubtitle')}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">{t('labels.role')}</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder={t('labels.rolePlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">{t('labels.interests')}</label>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${formData.interests.length >= 3 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
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
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => addInterest()}
                    className="h-[54px] w-[54px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-blue-200"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>

                {/* Suggested Interests */}
                <div className="flex flex-wrap gap-2">
                  {suggestedInterests.map((interest) => (
                    !formData.interests.includes(interest) && (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => addInterest(interest)}
                        className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full transition-colors"
                      >
                        + {interest}
                      </button>
                    )
                  ))}
                </div>
                
                {/* Selected Interest Tags */}
                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    {formData.interests.map((interest, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 bg-white text-blue-700 px-3 py-1.5 rounded-full text-sm shadow-sm border border-blue-100 animate-in zoom-in duration-200"
                      >
                        <span className="font-medium">{interest}</span>
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="hover:bg-blue-50 rounded-full p-0.5 transition-colors text-blue-400 hover:text-blue-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-Comment Settings */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{t('engagementSettings')}</h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Adjust your daily engagement limits
                    </div>
                  </div>
                </div>
                
                {/* Max Comments */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <label className="text-gray-600">{t('maxComments')}</label>
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{formData.maxCommentsPerDay} / day</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={formData.maxCommentsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxCommentsPerDay: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Max Likes */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <label className="text-gray-600">{t('maxLikes')}</label>
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{formData.maxLikesPerDay} / day</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={formData.maxLikesPerDay}
                    onChange={(e) => setFormData({ ...formData, maxLikesPerDay: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={!isFormComplete || isLoading}
                className={`w-full h-14 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isFormComplete 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('submitting')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>{t('submit')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </div>
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
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">{t('loading')}</p>
        </div>
      </div>
    }>
      <UserPreferences />
    </Suspense>
  )
}

export default OnboardingPageClient