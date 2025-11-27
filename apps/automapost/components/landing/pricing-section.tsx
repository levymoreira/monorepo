'use client'

import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle } from 'lucide-react'

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

export default function PricingSection() {
  const t = useTranslations()
  const locale = useLocale()
  const pricingPlans = t.raw('pricing.plans')

  const handlePlanClick = (plan: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_plan_click', {
        event_category: 'User Interaction',
        event_label: plan.name,
        value: 1
      })
    }
    // Trigger the focus-signup event to open dialog
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focus-signup', { detail: { scroll: true } }))
    }
  }

  return (
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
              onCtaClick={() => handlePlanClick(plan)}
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
  )
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}