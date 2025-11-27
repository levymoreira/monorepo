'use client'

import FavoriteButton from '@/components/blog/favorite-button'
import { useCallback } from 'react'

interface ArticleToolbarProps {
  postId: string
}

export default function ArticleToolbar({ postId }: ArticleToolbarProps) {
  const onShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // ignore user cancel or errors
    }
  }, [])

  const onListen = useCallback(() => {
    // Placeholder for a future TTS feature
  }, [])

  return (
    <div className="flex items-center justify-end gap-4 text-gray-500">
      <FavoriteButton postId={postId} />
      <button aria-label="Listen to article" onClick={onListen} className="p-2 rounded-md hover:text-gray-900">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8"/>
        </svg>
      </button>
      <button aria-label="Share article" onClick={onShare} className="p-2 rounded-md hover:text-gray-900">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/>
          <path d="M16 6l-4-4-4 4"/>
          <path d="M12 2v14"/>
        </svg>
      </button>
    </div>
  )
}


