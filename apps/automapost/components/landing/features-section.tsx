'use client'

import { useTranslations } from 'next-intl'
import { Zap, Calendar, BarChart3 } from 'lucide-react'

function FeatureCard({ feature }: { feature: any }) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">
        {feature.icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-neutral-dark">{feature.title}</h3>
      <p className="text-neutral-gray mb-4">{feature.description}</p>
    </div>
  )
}

export default function FeaturesSection() {
  const t = useTranslations()

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-accent" />,
      title: t('features.items.0.title'),
      description: t('features.items.0.description')
    },
    {
      icon: <Calendar className="w-8 h-8 text-accent" />,
      title: t('features.items.1.title'),
      description: t('features.items.1.description')
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-accent" />,
      title: t('features.items.2.title'),
      description: t('features.items.2.description')
    }
  ]

  return (
    <section id="features" data-section="features" className="section" aria-labelledby="features-heading">
      <div className="container">
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-neutral-gray max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}