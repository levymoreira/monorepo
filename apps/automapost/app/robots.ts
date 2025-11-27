import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '/public-data/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/public-data/', '/dashboard/', '/portal/', '/onboarding/'],
      },
    ],
    sitemap: 'https://automapost.com/sitemap.xml',
    host: 'https://automapost.com',
  }
}