'use client'

import { BookCheck, BarChart3, Lightbulb, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export function MobileNav() {
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    { 
      label: 'Publish', 
      href: '/portal/posts',
      icon: <BookCheck className="w-5 h-5" />
    },
    { 
      label: 'Analytics', 
      href: '/portal/analytics',
      icon: <BarChart3 className="w-5 h-5" />
    },
    { 
      label: 'Ideas', 
      href: '/portal/ideas',
      icon: <Lightbulb className="w-5 h-5" />
    },
    { 
      label: 'More', 
      href: '#',
      icon: <Menu className="w-5 h-5" />
    }
  ]

  const isActive = (href: string) => {
    if (href === '#') return false
    return pathname?.includes(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DADDE1] md:hidden h-[60px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-4 gap-1 px-4 h-full">
        {navItems.map((item) => {
          const active = isActive(item.href)
          
          return item.href === '#' ? (
            <button
              key={item.label}
              className={cn(
                "p-2 flex flex-col items-center justify-center transition-all rounded-xl",
                "text-[#6B7280] hover:text-[#0078D4] hover:bg-[#F0F2F5]"
              )}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "p-2 flex flex-col items-center justify-center transition-all rounded-xl relative",
                active 
                  ? "text-[#0078D4]" 
                  : "text-[#6B7280] hover:text-[#0078D4] hover:bg-[#F0F2F5]"
              )}
            >
              {active && (
                <span className="absolute top-1 w-1.5 h-1.5 bg-[#0078D4] rounded-full shadow-[0_0_10px_rgba(0,120,212,0.5)]" />
              )}
              <span className={active ? "text-[#0078D4]" : ""}>{item.icon}</span>
              <span className={cn("text-xs", active ? "font-bold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
