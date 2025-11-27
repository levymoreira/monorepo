'use client'

import { List, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewSwitcherProps {
  activeView: 'list' | 'calendar'
  onViewChange: (view: 'list' | 'calendar') => void
}

export function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center bg-[#F0F2F5] rounded-xl p-1">
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          "px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold flex items-center space-x-1 md:space-x-2 text-sm md:text-base transition-all cursor-pointer",
          activeView === 'list'
            ? "bg-white text-[#1C1E21] shadow-sm border border-[#DADDE1]"
            : "text-[#1C1E21] hover:text-[#1C1E21] hover:bg-white hover:shadow-sm hover:border hover:border-[#DADDE1]"
        )}
      >
        <List className="w-4 h-4" />
        <span>List</span>
      </button>
      <button
        onClick={() => onViewChange('calendar')}
        className={cn(
          "px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold flex items-center space-x-1 md:space-x-2 text-sm md:text-base transition-all cursor-pointer",
          activeView === 'calendar'
            ? "bg-white text-[#1C1E21] shadow-sm border border-[#DADDE1]"
            : "text-[#1C1E21] hover:text-[#1C1E21] hover:bg-white hover:shadow-sm hover:border hover:border-[#DADDE1]"
        )}
      >
        <Calendar className="w-4 h-4" />
        <span>Calendar</span>
      </button>
    </div>
  )
}
