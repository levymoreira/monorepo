'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ScaleIn, RotateInOnScroll } from '@/components/scroll-animations'

export default function HeroPost() {
  const t = useTranslations()

  const BlogPostCard = () => (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto border border-gray-100">
      {/* Featured Image Area */}
 
      
      <div className="p-6 text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {/* <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {t('hero.blogPost.category')}
            </span> */}
            <span className="text-neutral-gray text-xs flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('hero.blogPost.readTime')}
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-700">SEO Optimized</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-neutral-dark mb-2 leading-tight group-hover:text-primary transition-colors">
          {t('hero.blogPost.title')}
        </h3>
        
        <p className="text-neutral-gray text-sm mb-4 line-clamp-2">
          {t('hero.blogPost.excerpt')}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
               <Image 
                  src="/linkedin-user1.png" 
                  alt={t('hero.blogPost.author')}
                  fill
                  className="object-cover"
                />
            </div>
            <span className="text-sm font-medium text-neutral-dark">
              {t('hero.blogPost.author')}
            </span>
          </div>
          
          <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('hero.blogPost.seoScore')}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <ScaleIn className="relative mt-8 lg:mt-0 z-20">
        {/* Mobile version with scroll-triggered rotation */}
        <div className="block lg:hidden">
          <RotateInOnScroll initialRotation={3} finalRotation={0} threshold={0.3}>
            <BlogPostCard />
          </RotateInOnScroll>
        </div>
        
        {/* Desktop version with hover rotation */}
        <div className="hidden lg:block">
          <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300 hover:scale-[1.02]">
            <BlogPostCard />
          </div>
        </div>
      </ScaleIn>
    </>
  )
}