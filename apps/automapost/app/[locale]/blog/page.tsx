import Link from 'next/link'
import { generatePageMetadata } from '@/lib/metadata'
import { getTranslations } from 'next-intl/server'
import FavoriteButton from '@/components/blog/favorite-button'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface PageProps {
  params: Promise<{ locale: string }>
}

// Deterministic color for category labels
const CATEGORY_COLORS: string[] = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#84cc16']
function colorForCategory(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  const idx = Math.abs(hash) % CATEGORY_COLORS.length
  return CATEGORY_COLORS[idx]
}
function categoryLetters(name?: string | null): string {
  if (!name) return 'AP'
  return name.slice(0, 2).toUpperCase()
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return generatePageMetadata(locale, {
    title: t('title'),
    description: t('description', { default: 'Latest articles and product updates from AutomaPost.' }),
    path: '/blog'
  })
}

export default async function BlogIndexPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

  let posts: any[] = []
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import('@/lib/db')
      if ((db as any)?.blogPost) {
        posts = await (db as any).blogPost.findMany({
          where: { isPublished: true },
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            authorName: true,
            publishedAt: true,
            coverImageUrl: true,
            translations: {
              where: { locale: locale as any },
              select: { title: true, slug: true, excerpt: true, category: true }
            }
          }
        })
      }
    } catch (err) {
      console.warn('[blog] Skipping DB fetch for posts:', err)
    }
  }else{
    console.warn('[blog] Skipping DB fetch for posts: DATABASE_URL is not set')
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div className="space-y-6">
        {posts.map((post: any) => {
          const tr = post.translations[0]
          if (!tr) return null
          const href = locale === 'en' ? `/blog/${tr.slug}` : `/${locale}/blog/${tr.slug}`
          return (
            <article key={post.id} className="relative group border border-gray-200 rounded-xl p-5 hover:shadow-sm transition bg-white/90 cursor-pointer">
              {/* Make whole card clickable */}
              <Link href={href} className="absolute inset-0" aria-label={tr.title} />
              <div className="relative grid items-center gap-6" style={{ gridTemplateColumns: '1fr 11rem' }}>
                {/* Text content */}
                <div className="min-w-0 max-w-[540px]">
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                    {tr.category ? (
                      <>
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] text-[10px] font-semibold text-white"
                          style={{ backgroundColor: colorForCategory(tr.category) }}
                          aria-hidden="true"
                        >
                          {categoryLetters(tr.category)}
                        </span>
                        <span>In {tr.category}</span>
                        <span className="mx-1">by {post.authorName}</span>
                      </>
                    ) : (
                      <span>by {post.authorName}</span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                    <Link href={href}>{tr.title}</Link>
                  </h2>
                  {tr.excerpt ? <p className="text-gray-600 mt-2 line-clamp-2">{tr.excerpt}</p> : null}

                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-gray-500">
                      {post.publishedAt ? new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(post.publishedAt)) : ''}
                    </span>
                    <FavoriteButton postId={post.id} className="ml-auto relative z-10" />
                  </div>
                </div>

                {/* Right-side image (third column, fixed width) */}
                <Link href={href} className="relative z-10 block h-28 w-44 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center justify-self-end">
                  <img src={post.coverImageUrl || '/linkedin-user1.png'} alt="" className="h-full w-full object-cover object-center" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}


