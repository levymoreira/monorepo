import Link from 'next/link'
import FavoriteButton from '@/components/blog/favorite-button'

interface BlogPostCardProps {
  locale: string
  id: string
  href: string
  title: string
  excerpt?: string | null
  category?: string | null
  authorName: string
  publishedAt: Date | string | null
  coverImageUrl?: string | null
}

export default function BlogPostCard({
  locale,
  id,
  href,
  title,
  excerpt,
  category,
  authorName,
  publishedAt,
  coverImageUrl
}: BlogPostCardProps) {
  return (
    <article className="relative group border border-gray-200 rounded-xl p-5 hover:shadow-sm transition bg-white/90 cursor-pointer">
      <Link href={href} className="absolute inset-0" aria-label={title} />
      <div className="relative grid items-center gap-6" style={{ gridTemplateColumns: '1fr 11rem' }}>
        <div className="min-w-0 max-w-[540px]">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            {category ? (
              <>
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] text-[10px] font-semibold text-white"
                  style={{ backgroundColor: '#8b5cf6' }}
                  aria-hidden="true"
                >
                  {(category || 'AP').slice(0, 2).toUpperCase()}
                </span>
                <span>In {category}</span>
                <span className="mx-1">by {authorName}</span>
              </>
            ) : (
              <span>by {authorName}</span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-snug">
            <Link href={href}>{title}</Link>
          </h2>
          {excerpt ? <p className="text-gray-600 mt-2 line-clamp-2">{excerpt}</p> : null}
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">
              {publishedAt ? new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(publishedAt)) : ''}
            </span>
            <FavoriteButton postId={id} className="ml-auto relative z-10" />
          </div>
        </div>
        <Link href={href} className="relative z-10 block h-28 w-44 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center justify-self-end">
          <img src={coverImageUrl || '/linkedin-user1.png'} alt="" className="h-full w-full object-cover object-center" />
        </Link>
      </div>
    </article>
  )
}


