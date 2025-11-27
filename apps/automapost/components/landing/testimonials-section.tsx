'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Star } from 'lucide-react'

function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary/20 hover:-translate-y-2 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative mb-6">
        <svg className="w-12 h-12 text-primary/20 group-hover:text-primary/40 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
        </svg>
      </div>
      
      <div className="flex items-center mb-6 relative">
        <div className="flex items-center" role="img" aria-label={`${testimonial.rating} out of 5 stars rating`}>
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current mr-1 transform group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 100}ms`}} aria-hidden="true" />
          ))}
        </div>
        <span className="ml-2 text-sm font-medium text-neutral-gray">{testimonial.rating}.0</span>
      </div>
      
      <blockquote className="text-lg leading-relaxed text-neutral-dark mb-8 relative">
        <span className="text-2xl text-primary font-serif absolute -top-2 -left-1">"</span>
        <span className="relative z-10">{testimonial.quote}</span>
        <span className="text-2xl text-primary font-serif absolute -bottom-6 right-0">"</span>
      </blockquote>
      
      <div className="flex items-center relative">
        <div className="relative">
          {testimonial.image ? (
            <>
              <img
                src={testimonial.image}
                alt={`Profile photo of ${testimonial.author}, ${testimonial.role} at ${testimonial.company}`}
                className="w-16 h-16 rounded-full object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300 border-2 border-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement | null
                  if (nextElement) nextElement.style.display = 'flex'
                }}
              />
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300 hidden">
                {testimonial.author.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              {testimonial.author.split(' ').map((n: string) => n[0]).join('')}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 ring-2 ring-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="font-bold text-neutral-dark text-lg group-hover:text-primary transition-colors duration-300">{testimonial.author}</div>
          <div className="text-neutral-gray font-medium">{testimonial.role}</div>
          <div className="text-sm text-neutral-gray/80">{testimonial.company}</div>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const t = useTranslations()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const testimonials = t.raw('testimonials.items')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <section id="reviews" data-section="social_proof" className="section relative overflow-hidden" aria-labelledby="reviews-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>
      <div className="absolute top-20 -left-40 w-80 h-80 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-40 w-80 h-80 bg-gradient-to-l from-accent/5 to-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full text-sm font-medium text-primary mb-6">
            <svg className="w-4 h-4 mr-2 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {t('testimonials.badge')}
          </div>
          
          <h2 id="reviews-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
            {t('testimonials.title')} <span className="gradient-text">{t('testimonials.titleHighlight')}</span> {t('testimonials.titleSuffix')}
          </h2>
          <p className="text-xl text-neutral-gray max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="transform" style={{animationDelay: `${index * 200}ms`}}>
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {t.raw('testimonials.trustBadges').map((badge: any, index: number) => (
              <div key={index} className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20">
                <div className="flex items-center justify-center space-x-3">
                  <div>
                    <div className="font-semibold text-neutral-dark">{badge.title}</div>
                    <div className="text-sm text-neutral-gray">{badge.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}