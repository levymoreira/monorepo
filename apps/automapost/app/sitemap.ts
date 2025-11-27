import { MetadataRoute } from 'next'
import { db, blogPostTranslations, blogPosts } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

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
  let enTranslations: Array<{ slug: string; updatedAt: Date | null; publishedAt: Date | null }> = []
  
  try {
    const results = await db.select({
      slug: blogPostTranslations.slug,
      updatedAt: blogPosts.updatedAt,
      publishedAt: blogPosts.publishedAt,
    })
      .from(blogPostTranslations)
      .innerJoin(blogPosts, eq(blogPostTranslations.postId, blogPosts.id))
      .where(and(
        eq(blogPostTranslations.locale, 'en'),
        eq(blogPosts.isPublished, true)
      ))
    
    enTranslations = results
  } catch {
    // DB not available during build
  }

  const postEntries: MetadataRoute.Sitemap = enTranslations.map((tr) => {
    const lastModified = tr.updatedAt || tr.publishedAt || currentDate
    const url = `${baseUrl}/blog/${tr.slug}`
    return { url, lastModified, changeFrequency: 'weekly', priority: 0.6 }
  })

  return [...staticEntries, ...blogIndexes, ...postEntries]
}