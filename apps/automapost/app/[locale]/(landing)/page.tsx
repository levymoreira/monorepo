import HomePageWrapper from '@/components/landing/home-page-wrapper'
import { generatePageMetadata } from '@/lib/metadata'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  return generatePageMetadata(locale)
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  
  return <HomePageWrapper />
}

