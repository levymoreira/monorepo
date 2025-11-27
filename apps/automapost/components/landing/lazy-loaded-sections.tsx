'use client'

import dynamic from 'next/dynamic'

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
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />
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

export default function LazyLoadedSections() {
  return (
    <>
      <Stats />
      <ProblemSolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTABanner
        title="Ready to Transform Your SEO Strategy?"
        subtitle="Join thousands of professionals already using AutomaPost to rank higher"
        ctaText="Start Free Trial"
        urgency="Limited time offer - 50% off for the first 100 users!"
        variant="primary"
      />
    </>
  )
}