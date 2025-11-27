import { Metadata } from 'next'

interface MetadataOverrides {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImageAlt?: string
  path?: string
  robots?: {
    index?: boolean
    follow?: boolean
  }
}

function getLocaleString(locale: string): string {
  switch (locale) {
    case 'en': return 'en_US'
    case 'es': return 'es_ES'
    case 'pt': return 'pt_PT'
    case 'br': return 'pt_BR'
    case 'fr': return 'fr_FR'
    default: return 'en_US'
  }
}

export async function generatePageMetadata(
  locale: string = 'en',
  overrides: MetadataOverrides = {},
  alternateLanguagePaths?: Record<string, string>
): Promise<Metadata> {
  // Import the appropriate dictionary
  let dictionary;
  try {
    dictionary = await import(`../dictionaries/${locale}.json`)
  } catch {
    // Fallback to English if locale not found
    dictionary = await import(`../dictionaries/en.json`)
  }
  
  const metadata = dictionary.metadata || {}
  
  // Use overrides or fallback to defaults
  const title = overrides.title || metadata.title || 'AutomaPost - AI-Powered Blog Post Generator & SEO Scheduler | Boost Organic Traffic'
  const description = overrides.description || metadata.description || 'Generate SEO-optimized blog posts with AI, schedule them automatically, and track rankings.'
  const ogTitle = overrides.ogTitle || title
  const ogDescription = overrides.ogDescription || description
  const path = overrides.path || ''
  const fullUrl = locale === 'en' ? 
    `https://automapost.com${path ? `${path}` : ''}` :
    `https://automapost.com${path ? `/${locale}${path}` : ''}`
  
  // Build alternate language URLs (allow per-locale overrides)
  const defaultLanguagePaths = {
    'en-US': path ? `${path}` : '/',
    'es-ES': path ? `/es${path}` : '/es',
    'pt-PT': path ? `/pt${path}` : '/pt',
    'fr-FR': path ? `/fr${path}` : '/fr',
    'pt-BR': path ? `/br${path}` : '/br',
  } as Record<string, string>

  const languagePaths = alternateLanguagePaths
    ? {
        'en-US': alternateLanguagePaths['en'] ?? defaultLanguagePaths['en-US'],
        'es-ES': alternateLanguagePaths['es'] ?? defaultLanguagePaths['es-ES'],
        'pt-PT': alternateLanguagePaths['pt'] ?? defaultLanguagePaths['pt-PT'],
        'fr-FR': alternateLanguagePaths['fr'] ?? defaultLanguagePaths['fr-FR'],
        'pt-BR': alternateLanguagePaths['br'] ?? defaultLanguagePaths['pt-BR'],
      }
    : defaultLanguagePaths

  return {
    title,
    description,
    keywords: overrides.keywords || metadata.keywords || 'SEO automation, AI blog post generator, content scheduler, SEO marketing, content automation, organic traffic, AI content creation, blog management',
    authors: [{ name: metadata.author || 'AutomaPost Team' }],
    creator: metadata.creator || 'AutomaPost',
    publisher: metadata.publisher || 'AutomaPost',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: fullUrl,
      siteName: 'AutomaPost',
      locale: getLocaleString(locale),
      type: 'website',
      images: [
        {
          url: '/og-image.svg',
          width: 1200,
          height: 630,
          alt: overrides.ogImageAlt || metadata.ogImageAlt || 'AutomaPost - AI-Powered SEO Automation',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ['/og-image.svg'],
      creator: metadata.twitterCreator || '@automapost',
    },
    robots: {
      index: overrides.robots?.index ?? true,
      follow: overrides.robots?.follow ?? true,
      googleBot: {
        index: overrides.robots?.index ?? true,
        follow: overrides.robots?.follow ?? true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
      languages: languagePaths,
    },
  }
}