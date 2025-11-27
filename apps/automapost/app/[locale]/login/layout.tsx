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
    title: 'Sign In - AutomaPost | Welcome Back',
    description: 'Sign in to AutomaPost to manage your LinkedIn content with AI-powered tools.',
    keywords: 'automapost login, sign in, linkedin automation, content management',
    ogTitle: 'Sign In - AutomaPost',
    ogDescription: 'Access your AI-powered LinkedIn content management dashboard.',
    ogImageAlt: 'AutomaPost - Sign In',
    path: '/login',
    robots: { index: false, follow: false },
  })
}

export default function LoginLayout({ children }: LayoutProps) {
  return <>{children}</>
}
