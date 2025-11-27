import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import HeroInteractive from './hero-interactive'
import HeroFloatingWrapper from './hero-floating-wrapper'

export default async function HeroSection() {
  const t = await getTranslations()

  return (
    <section data-section="hero" className="section min-h-screen flex items-center hero-grid-bg pt-24 sm:pt-16 pb-8 relative">
      <HeroFloatingWrapper>
        <div className="space-y-8">
          <div className="space-y-4 mt-8 sm:mt-0 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              {t('hero.title')} {' '}
              <span className="gradient-text">{t('hero.titleHighlight')}</span> {t('hero.titleSuffix')}
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl text-neutral-gray font-normal">
              {t('hero.subtitle')}
            </h2>
            <p className="text-base sm:text-lg text-neutral-gray">
              {t('hero.description')}
            </p>
          </div>
          
          {/* Interactive elements delegated to client component */}
          <HeroInteractive />
        </div>
      </HeroFloatingWrapper>
    </section>
  )
}