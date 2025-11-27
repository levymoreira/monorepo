'use client'

import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  label: string
  count: number
  isActive?: boolean
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center space-x-1 border-b border-[#DADDE1] overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium flex items-center space-x-1 md:space-x-2 whitespace-nowrap text-sm md:text-base transition-all cursor-pointer",
              isActive
                ? "border-[#0078D4] text-[#1C1E21] font-semibold"
                : "border-transparent text-[#6B7280] hover:text-[#1C1E21] hover:border-[#0078D4]"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 md:py-1 rounded-full font-medium border",
                isActive
                  ? "border-[#0078D4] text-[#0078D4] bg-[#EBF4FF]"
                  : "border-[#DADDE1] text-gray-600"
              )}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
