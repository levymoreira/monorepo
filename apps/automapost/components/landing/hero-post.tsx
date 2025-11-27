'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ScaleIn, RotateInOnScroll } from '@/components/scroll-animations'

export default function HeroPost() {
  const t = useTranslations()

  return (
    <>
      <ScaleIn className="relative mt-8 lg:mt-0 z-20">
        {/* Mobile version with scroll-triggered rotation */}
        <div className="block lg:hidden">
          <RotateInOnScroll initialRotation={3} finalRotation={0} threshold={0.3}>
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
              <div className="bg-gradient-to-r from-primary to-accent rounded-lg mb-4">
                <div className="flex items-center space-x-3 text-neutral-dark">
                  <Image 
                    src="/linkedin-user1.png" 
                    alt={`Profile photo of ${t('hero.linkedinPost.author')}, ${t('hero.linkedinPost.role')}`}
                    width={44}
                    height={40}
                    className="rounded-full object-cover"
                    loading="eager"
                    priority
                  />
                  <div>
                    <div className="font-semibold">{t('hero.linkedinPost.author')}</div>
                    <div className="text-sm opacity-90">{t('hero.linkedinPost.role')}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-neutral-dark">
                  {t('hero.linkedinPost.content1')}
                </p>
                <p className="text-neutral-dark whitespace-pre-line">
                  {t('hero.linkedinPost.content2')}
                </p>
                <p className="text-neutral-dark">
                  {t('hero.linkedinPost.content3')}
                </p>
                <div className="flex items-center justify-between text-sm text-neutral-gray">
                  <span>{t('hero.linkedinPost.hashtags')}</span>
                  <span>{t('hero.linkedinPost.timeAgo')}</span>
                </div>
              </div>
            </div>
          </RotateInOnScroll>
        </div>
        
        {/* Desktop version with hover rotation */}
        <div className="hidden lg:block">
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300"
          >
            <div className="bg-gradient-to-r from-primary to-accent rounded-lg mb-4">
              <div className="flex items-center space-x-3 text-neutral-dark">
                <Image 
                  src="/linkedin-user1.png" 
                  alt={`Profile photo of ${t('hero.linkedinPost.author')}, ${t('hero.linkedinPost.role')}`}
                  width={44}
                  height={40}
                  className="rounded-full object-cover"
                  loading="eager"
                  priority
                />
                <div>
                  <div className="font-semibold">{t('hero.linkedinPost.author')}</div>
                  <div className="text-sm opacity-90">{t('hero.linkedinPost.role')}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-neutral-dark">
                {t('hero.linkedinPost.content1')}
              </p>
              <p className="text-neutral-dark whitespace-pre-line">
                {t('hero.linkedinPost.content2')}
              </p>
              <p className="text-neutral-dark">
                {t('hero.linkedinPost.content3')}
              </p>
              <div className="flex items-center justify-between text-sm text-neutral-gray">
                <span>{t('hero.linkedinPost.hashtags')}</span>
                <span>{t('hero.linkedinPost.timeAgo')}</span>
              </div>
            </div>
          </div>
        </div>
      </ScaleIn>
    </>
  )
}