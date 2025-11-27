'use client'

import { Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingComposeProps {
  onClick?: () => void
  className?: string
}

export function FloatingCompose({ onClick, className }: FloatingComposeProps) {
  return (
    <div className={cn("fixed bottom-18 right-4 md:hidden z-50", className)}>
      <button
        onClick={onClick}
        className="bg-[#0078D4] text-white font-semibold rounded-full shadow-[0_0_20px_rgba(0,120,212,0.15)] transition-all duration-200 ease-in-out flex items-center space-x-2 px-4 py-3 hover:scale-105 active:scale-95"
      >
        <Edit3 className="w-5 h-5" />
      </button>
    </div>
  )
}
