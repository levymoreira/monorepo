'use client'

import { useEffect, useState } from 'react'

interface FavoriteButtonProps {
  postId: string
  className?: string
}

const STORAGE_KEY = 'automapost:favorites'

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function writeFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favs)))
  } catch {
    // ignore
  }
}

export default function FavoriteButton({ postId, className }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const favs = readFavorites()
    setIsFav(favs.has(postId))
  }, [postId])

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const favs = readFavorites()
    if (favs.has(postId)) {
      favs.delete(postId)
      setIsFav(false)
    } else {
      favs.add(postId)
      setIsFav(true)
    }
    writeFavorites(favs)
  }

  return (
    <button
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFav}
      onClick={toggle}
      className={`p-2 rounded-md ${isFav ? 'text-gray-900' : 'text-gray-500'} hover:text-gray-900 ${className || ''}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    </button>
  )
}


