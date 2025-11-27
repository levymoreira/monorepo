import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db, blogPostTranslations, blogPosts } from '@/lib/db'
import type { Locale } from '@/lib/db'
import { generatePageMetadata } from '@/lib/metadata'
import { getTranslations } from 'next-intl/server'
import { eq, and, desc } from 'drizzle-orm'
import ArticleToolbar from '@/components/blog/article-toolbar'
import BlogPostCard from '@/components/blog/post-card'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

async function getPostByLocaleAndSlug(locale: string, slug: string) {
  // Get translation with its post
  const translationResults = await db.select({
    id: blogPostTranslations.id,
    title: blogPostTranslations.title,
    excerpt: blogPostTranslations.excerpt,
    slug: blogPostTranslations.slug,
    content: blogPostTranslations.content,
    metaTitle: blogPostTranslations.metaTitle,
    metaDescription: blogPostTranslations.metaDescription,
    postId: blogPostTranslations.postId,
    postIsPublished: blogPosts.isPublished,
    postPublishedAt: blogPosts.publishedAt,
    postReadMinutes: blogPosts.readMinutes,
    postAuthorName: blogPosts.authorName,
    postCoverImageUrl: blogPosts.coverImageUrl,
  })
    .from(blogPostTranslations)
    .innerJoin(blogPosts, eq(blogPostTranslations.postId, blogPosts.id))
    .where(and(
      eq(blogPostTranslations.locale, locale as Locale),
      eq(blogPostTranslations.slug, slug)
    ))
    .limit(1)

  const row = translationResults[0]
  if (!row || !row.postIsPublished) return null

  // Get all translations for this post
  const allTranslations = await db.select({
    locale: blogPostTranslations.locale,
    slug: blogPostTranslations.slug,
    title: blogPostTranslations.title,
  })
    .from(blogPostTranslations)
    .where(eq(blogPostTranslations.postId, row.postId))

  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    slug: row.slug,
    content: row.content,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    post: {
      id: row.postId,
      isPublished: row.postIsPublished,
      publishedAt: row.postPublishedAt,
      readMinutes: row.postReadMinutes,
      authorName: row.postAuthorName,
      coverImageUrl: row.postCoverImageUrl,
      translations: allTranslations,
    }
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const tr = await getPostByLocaleAndSlug(locale, slug)
  if (!tr) return {}

  const currentPath = `/blog/${tr.slug}`
  const alternateLanguagePaths: Record<string, string> = {}
  for (const t of tr.post.translations) {
    const p = `/blog/${t.slug}`
    alternateLanguagePaths[t.locale] = t.locale === 'en' ? p : `/${t.locale}${p}`
  }

  return generatePageMetadata(locale, {
    title: tr.metaTitle || tr.title,
    description: tr.metaDescription || tr.excerpt || undefined,
    path: currentPath
  }, alternateLanguagePaths)
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const tr = await getPostByLocaleAndSlug(locale, slug)
  if (!tr) notFound()

  // Fetch 3 previous posts for recommendations (excluding current)
  const morePostsResults = await db.select({
    id: blogPosts.id,
    authorName: blogPosts.authorName,
    coverImageUrl: blogPosts.coverImageUrl,
    publishedAt: blogPosts.publishedAt,
    translationTitle: blogPostTranslations.title,
    translationSlug: blogPostTranslations.slug,
    translationExcerpt: blogPostTranslations.excerpt,
    translationCategory: blogPostTranslations.category,
  })
    .from(blogPosts)
    .innerJoin(blogPostTranslations, and(
      eq(blogPostTranslations.postId, blogPosts.id),
      eq(blogPostTranslations.locale, locale as Locale)
    ))
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
    .limit(9)

  const morePosts = morePostsResults.map(row => ({
    id: row.id,
    authorName: row.authorName,
    coverImageUrl: row.coverImageUrl,
    publishedAt: row.publishedAt,
    translations: [{
      title: row.translationTitle,
      slug: row.translationSlug,
      excerpt: row.translationExcerpt,
      category: row.translationCategory,
    }]
  }))
  const recommendations = morePosts
    .filter(p => p.id !== tr.post.id)
    .slice(0, 3)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 flex-wrap">
          <li>
            <Link className="hover:text-gray-800 underline-offset-2 hover:underline" href={locale === 'en' ? '/' : `/${locale}`}>Home</Link>
          </li>
          <li className="mx-1">/</li>
          <li>
            <Link className="hover:text-gray-800 underline-offset-2 hover:underline" href={locale === 'en' ? '/blog' : `/${locale}/blog`}>Blog</Link>
          </li>
          <li className="mx-1">/</li>
          <li>
            <Link className="text-gray-800 font-medium hover:text-gray-900" href={locale === 'en' ? `/blog/${tr.slug}` : `/${locale}/blog/${tr.slug}`}>{tr.title}</Link>
          </li>
        </ol>
      </nav>

      {/* note: back link moved to the bottom */}
      {/* Banner image moved just below breadcrumbs/back link */}
      <div className="mb-8 h-56 w-full overflow-hidden rounded-xl bg-gray-100">
        <img
          src={tr.post.coverImageUrl || '/og-image.svg'}
          alt={tr.title}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{tr.title}</h1>
      {tr.excerpt ? <p className="text-xl text-gray-600 mb-6">{tr.excerpt}</p> : null}
      <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
        <span className="font-medium text-gray-700">{tr.post.authorName}</span>
        {typeof tr.post.readMinutes === 'number' ? (
          <>
            <span>•</span>
            <span>{tr.post.readMinutes} min read</span>
          </>
        ) : null}
        {tr.post.publishedAt ? (
          <>
            <span>•</span>
            <span>{new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date(tr.post.publishedAt))}</span>
          </>
        ) : null}
      </div>

      {/* Divider + toolbar */}
      <div className="relative mb-8">
        <div className="h-px w-full bg-gray-200" />
        <div className="absolute inset-0 flex items-center justify-end">
          <ArticleToolbar postId={tr.post.id} />
        </div>
        <div className="mt-10 h-px w-full bg-gray-200" />
      </div>

      <article className="prose prose-neutral max-w-none">
        <div dangerouslySetInnerHTML={{ __html: tr.content }} />
      </article>

      {/* Bottom divider */}
      <div className="mt-10 h-px w-full bg-gray-200" />

      {/* Back link at bottom */}
      <div className="mt-10">
        <Link href={locale === 'en' ? '/blog' : `/${locale}/blog`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back to blog</span>
        </Link>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold mb-4">You may also like:</h2>
          <div className="space-y-4">
            {recommendations.map((p) => {
              const tr2 = p.translations[0]
              if (!tr2) return null
              const href = locale === 'en' ? `/blog/${tr2.slug}` : `/${locale}/blog/${tr2.slug}`
              return (
                <BlogPostCard
                  key={p.id}
                  locale={locale}
                  id={p.id}
                  href={href}
                  title={tr2.title}
                  excerpt={tr2.excerpt}
                  category={tr2.category || undefined}
                  authorName={p.authorName}
                  publishedAt={p.publishedAt}
                  coverImageUrl={p.coverImageUrl}
                />
              )
            })}
          </div>
        </section>
      ) : null}
    </main>
  )
}


