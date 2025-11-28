'use client'

import { useTranslations, useLocale } from 'next-intl'

export default function HowItWorksSection() {
  const t = useTranslations()
  const locale = useLocale()

  const handleGetStarted = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_get_started_click', {
        event_category: 'User Interaction',
        event_label: 'Try It Free Now',
        value: 1
      })
    }
    // Redirect to signup
    if (typeof window !== 'undefined') {
      window.location.href = `/${locale}/signup`
    }
  }

  return (
    <section data-section="how_it_works" className="section-alt relative overflow-hidden">
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
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold shadow-xl border-primary z-10">
                  {index + 1}
                </div>
                
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
        
        <div className="text-center">
          <button
            className="btn btn-primary btn-xl group relative overflow-hidden"
            onClick={handleGetStarted}
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
  )
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}