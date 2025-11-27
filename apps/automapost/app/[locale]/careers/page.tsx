import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import CareersContent from '@/components/careers-content'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  
  return generatePageMetadata(locale, {
    title: 'Careers at AutomaPost - Join Our Mission | AI LinkedIn Automation Jobs',
    description: 'Join AutomaPost\'s small but ambitious team building AI-powered LinkedIn automation tools. Remote-first, customer-focused roles in engineering and growth.',
    keywords: 'automapost careers, jobs, remote work, linkedin automation jobs, ai startup careers, engineering jobs',
    ogTitle: 'Careers at AutomaPost - Join Our Mission',
    ogDescription: 'Join AutomaPost\'s small but ambitious team building AI-powered LinkedIn automation tools. Remote-first, customer-focused roles.',
    ogImageAlt: 'AutomaPost - Careers and Job Opportunities',
    path: '/careers',
  })
}

export default async function CareersPage({ params }: PageProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <CareersContent />
      <Footer />
    </div>
  )
}


