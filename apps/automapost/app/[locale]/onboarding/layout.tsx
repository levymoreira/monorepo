import { Metadata } from 'next'
import { ReactNode } from 'react'
import { generatePageMetadata } from '@/lib/metadata'
import { getTranslations } from 'next-intl/server'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'onboarding.metadata' })

  return generatePageMetadata(locale, {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    ogTitle: t('ogTitle'),
    ogDescription: t('ogDescription'),
    ogImageAlt: t('ogImageAlt'),
    path: '/onboarding',
    robots: { index: false, follow: false },
  })
}

export default function OnboardingLayout({ children }: LayoutProps) {
  return <>{children}</>
}