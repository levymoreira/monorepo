'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import HeroSection from '@/components/landing/hero-section'

// Lazy load all below-the-fold sections
const Stats = dynamic(() => import('@/components/stats'), {
  loading: () => <div className="h-32 bg-gray-50 animate-pulse" />,
})

const ProblemSolutionSection = dynamic(() => import('./problem-solution-section'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
})

const FeaturesSection = dynamic(() => import('./features-section'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
})

const HowItWorksSection = dynamic(() => import('./how-it-works-section'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
})

const TestimonialsSection = dynamic(() => import('./testimonials-section'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
})

const PricingSection = dynamic(() => import('./pricing-section'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
})

const FAQSection = dynamic(() => import('./faq-section'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
})

const CTABanner = dynamic(() => import('@/components/cta-banner'), {
  loading: () => <div className="h-64 bg-primary animate-pulse" />,
})

export default function HomePageOptimized() {
  return (
    <main id="main-content">
      {/* Critical above-the-fold content - Server Component */}
      <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" />}>
        <HeroSection />
      </Suspense>

      {/* Below-the-fold content - Lazy loaded */}
      <Stats />
      <ProblemSolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTABanner
        title="Ready to Transform Your Social Media?"
        subtitle="Join thousands of professionals already using AutomaPost"
        ctaText="Start Free Trial"
        urgency="Limited time offer - 50% off for the first 100 users!"
        variant="primary"
      />
    </main>
  )
}