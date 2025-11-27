import { Metadata } from 'next'
import { ReactNode } from 'react'
import { generatePageMetadata } from '@/lib/metadata'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params
  
  return generatePageMetadata(locale, {
    title: 'Public Analytics - AutomaPost | LinkedIn Growth Data & Insights',
    description: 'View AutomaPost\'s public analytics dashboard showing LinkedIn automation trends, user growth, and engagement metrics. Transparent performance data.',
    keywords: 'automapost analytics, public data, linkedin trends, growth metrics, engagement analytics, social media insights',
    ogTitle: 'Public Analytics - AutomaPost',
    ogDescription: 'View AutomaPost\'s public analytics dashboard showing LinkedIn automation trends and growth metrics.',
    ogImageAlt: 'AutomaPost - Public Analytics Dashboard',
    path: '/public-data',
  })
}

export default function PublicDataLayout({ children }: LayoutProps) {
  return <>{children}</>
}