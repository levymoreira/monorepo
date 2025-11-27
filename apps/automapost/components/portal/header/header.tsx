'use client'

import { Menu, Plus, Settings, Bell, HelpCircle, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PrimaryButton } from '../button/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { isDevelopment } from '@/lib/env'

interface HeaderProps {
  onMenuClick?: () => void
  userInitials?: string
  onNewPost?: () => void
}

interface NavItem {
  label: string
  href: string
}

export function Header({ onMenuClick, userInitials = 'JD', onNewPost }: HeaderProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  
  const navItems: NavItem[] = [
    { label: 'Publish', href: '/portal/posts' },
    { label: 'Analytics', href: '/portal/analytics' },
    { label: 'Ideas', href: '/portal/ideas' }
  ]

  const isActiveNav = (href: string) => {
    return pathname?.includes(href)
  }

  return (
    <header className="bg-white border-b border-[#DADDE1] flex-shrink-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Logo, Mobile Menu, and Navigation */}
          <div className="flex items-center min-w-0 flex-shrink">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6 text-[#1C1E21]" />
            </button>
            
            {/* Logo */}
            <Link href="/portal/posts" className="ml-2 md:ml-0 cursor-pointer">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="160" 
                height="36" 
                viewBox="0 0 160 36" 
                className="h-9 max-w-full flex-shrink hover:opacity-80 transition-opacity"
              >
                <g transform="translate(0, -2) scale(0.4)">
                  <g>
                    <path d="M70,57c-4.8,0-8.9,3.4-9.8,8H47c-0.6,0-1,0.5-1,1.1c0,0.3,0,0.6,0,0.9c0,1-0.1,1.9-0.3,2.8 c-0.1,0.6,0.4,1.2,1,1.2h14.1c1.5,3.5,5.1,6,9.2,6c5.5,0,10-4.5,10-10C80,61.5,75.5,57,70,57z" fill="#1F2937"/>
                  </g>
                  <g>
                    <path d="M43.3,45.5c-1.2-0.5-2.3-1.2-3.3-2c-0.5-0.4-1.2-0.2-1.5,0.3l-7.1,13.3C31,57,30.5,57,30,57 c-5.5,0-10,4.5-10,10c0,5.5,4.5,10,10,10c5.5,0,10-4.5,10-10c0-2.9-1.2-5.4-3.1-7.3l6.9-12.8C44,46.4,43.8,45.8,43.3,45.5z" fill="#1F2937"/>
                  </g>
                  <g>
                    <path d="M50,41c1,0,1.9-0.1,2.8-0.4l6.9,12.7c0.3,0.5,0.9,0.7,1.4,0.4c1.1-0.7,2.2-1.3,3.4-1.7 c0.6-0.2,0.8-0.9,0.5-1.4l-7.2-13.4c1.3-1.7,2.2-3.9,2.2-6.2c0-5.5-4.5-10-10-10s-10,4.5-10,10C40,36.5,44.5,41,50,41z" fill="#1F2937"/>
                  </g>
                </g>
                <text x="40" y="24" fontSize="20" fill="#1F2937" fontFamily="system-ui, sans-serif" fontWeight="700">
                  AutomaPost
                </text>
              </svg>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 ml-16">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm px-4 py-2.5 rounded-xl transition-all relative",
                    "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[2px] after:bg-[#0078D4] after:transition-all after:duration-200 after:-translate-x-1/2",
                    "hover:after:w-[40%]",
                    isActiveNav(item.href) 
                      ? "text-[#1C1E21] font-bold after:w-full after:h-[3px]" 
                      : "text-[#6B7280] hover:text-[#0078D4] font-medium"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Navigation Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {/* New Post Button - Hidden on mobile (in bottom nav) */}
            <PrimaryButton
              onClick={onNewPost}
              icon={<Plus className="w-4 h-4" />}
              size="lg"
              className="hidden md:flex"
            >
              New Post
            </PrimaryButton>
            
            {/* Settings - Hidden on mobile and in production */}
            {isDevelopment() && (
              <button className="hidden md:block p-2.5 rounded-xl hover:bg-[#F0F2F5] transition-colors cursor-pointer">
                <Settings className="w-5 h-5 text-[#1C1E21]" />
              </button>
            )}
            
            {/* Notifications - Hidden on mobile and in production */}
            {isDevelopment() && (
              <button className="hidden md:block p-2.5 rounded-xl hover:bg-[#F0F2F5] relative transition-colors cursor-pointer">
                <Bell className="w-5 h-5 text-[#1C1E21]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#0078D4] rounded-full animate-pulse"></span>
              </button>
            )}
            
            {/* Help - Hidden on mobile and in production */}
            {isDevelopment() && (
              <button className="hidden md:block p-2.5 rounded-xl hover:bg-[#F0F2F5] transition-colors cursor-pointer">
                <HelpCircle className="w-5 h-5 text-[#1C1E21]" />
              </button>
            )}
            
            {/* Profile - Hidden on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex w-10 h-10 rounded-full border border-[#1C1E21] bg-[#F0F2F5] items-center justify-center transition-all hover:opacity-80 cursor-pointer">
                  <span className="font-bold text-base text-[#1C1E21]">{userInitials}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/settings">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault()
                    void logout()
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
