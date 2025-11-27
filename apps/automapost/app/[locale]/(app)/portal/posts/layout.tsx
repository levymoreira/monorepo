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
    title: 'Posts - AutomaPost | LinkedIn Content Management',
    description: 'Manage your LinkedIn posts, create content, and track performance with AutomaPost advanced content management tools.',
    keywords: 'automapost posts, linkedin content management, post creation, content strategy, social media posts',
    ogTitle: 'Posts - AutomaPost',
    ogDescription: 'Manage your LinkedIn posts and content strategy with AutomaPost.',
    ogImageAlt: 'AutomaPost - Posts Management',
    path: '/portal/posts',
    robots: { index: false, follow: false },
  })
}

export default function PostsLayout({ children }: LayoutProps) {
  return <>{children}</>
}
