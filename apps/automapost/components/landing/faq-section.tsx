'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp } from 'lucide-react'

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleFAQ = useCallback(() => {
    const newState = !isOpen
    
    // Track FAQ click event only when expanding (opening)
    if (!isOpen && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_faq_click', {
        event_category: 'User Interaction',
        event_label: question,
        value: 1
      })
    }
    
    setIsOpen(newState)
  }, [isOpen, question])

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-6 text-left focus:outline-none hover:bg-gray-50 transition-colors cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={toggleFAQ}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="text-lg font-semibold text-neutral-dark pr-4">{question}</span>
        <span className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary" />
          )}
        </span>
      </button>
      {isOpen && (
        <div 
          className="pb-6 fade-in"
          id={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <p className="text-neutral-gray leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQSection() {
  const t = useTranslations()
  const faqs = t.raw('faq.items')

  return (
    <section id="faq" data-section="faq" className="section" aria-labelledby="faq-heading">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-xl text-neutral-gray">
              {t('faq.subtitle')}
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq: any, index: number) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
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