import { ReactNode } from 'react'
import Navigation from '@/components/landing/navigation'
import Footer from '@/components/landing/footer'

interface BlogLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 pt-16">
        {children}
      </div>
      <Footer />
    </div>
  )
}


