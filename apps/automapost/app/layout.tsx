import { ReactNode } from 'react'
import { Metadata, Viewport } from 'next'
import enDictionary from '../dictionaries/en.json'
import './globals.css'

const defaultMetadata = enDictionary.metadata

export const metadata: Metadata = {
  metadataBase: new URL('https://automapost.com'),
  title: {
    default: defaultMetadata.title,
    template: defaultMetadata.titleTemplate
  },
  description: defaultMetadata.description,
  applicationName: defaultMetadata.applicationName,
  referrer: 'origin-when-cross-origin',
  keywords: defaultMetadata.keywords.split(', '),
  authors: [{ name: defaultMetadata.author }],
  creator: defaultMetadata.creator,
  publisher: defaultMetadata.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

interface RootLayoutProps {
  children: ReactNode
}

// This layout is just a wrapper - the actual layout logic is in [locale]/layout.tsx
export default function RootLayout({ children }: RootLayoutProps) {
  return children
}