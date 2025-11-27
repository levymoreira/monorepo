import { ReactNode } from 'react'
import Navigation from '@/components/landing/navigation'
import Footer from '@/components/landing/footer'

interface LandingLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LandingLayout({ children, params }: LandingLayoutProps) {
  const { locale } = await params
  return (
    <div className="min-h-screen">
      <Navigation />
      {children}
      <Footer />
    </div>
  )
}