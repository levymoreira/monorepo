import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()
  const baseUrl = 'https://automapost.com'

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: currentDate, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/careers`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/cookies`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/#features`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/#pricing`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/#faq`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
  ]

  // Blog index (canonical only)
  const blogIndexes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 }
  ]

  // Blog posts (canonical English only) - query only when DB is available during runtime
  let enTranslations: Array<{ slug: string; post: { updatedAt: Date | null; publishedAt: Date | null } }> = []
  
  const { db } = await import('@/lib/db')
  if (db?.blogPostTranslation) {
    enTranslations = await db.blogPostTranslation.findMany({
      where: { locale: 'en', post: { isPublished: true } },
      select: {
        slug: true,
        post: { select: { updatedAt: true, publishedAt: true } }
      }
    })
  }

  const postEntries: MetadataRoute.Sitemap = enTranslations.map((tr) => {
    const lastModified = tr.post.updatedAt || tr.post.publishedAt || currentDate
    const url = `${baseUrl}/blog/${tr.slug}`
    return { url, lastModified, changeFrequency: 'weekly', priority: 0.6 }
  })

  return [...staticEntries, ...blogIndexes, ...postEntries]
}