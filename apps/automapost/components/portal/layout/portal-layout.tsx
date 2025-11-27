'use client'

import { useState } from 'react'
import { Header } from '../header/header'
import { Sidebar } from '../sidebar/sidebar'
import { MobileNav } from '../mobile-nav/mobile-nav'
import { FloatingCompose } from '../floating-compose/floating-compose'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ApplicationProvider, useChannel } from '@/contexts/ApplicationContext'

interface PortalLayoutProps {
  children: React.ReactNode
  onNewPost?: () => void
  userInitials?: string
}

function PortalContent({ children, onNewPost, userInitials = 'JD' }: PortalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { selectedChannel } = useChannel()
  const router = useRouter()

  const computeInitials = (): string => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return parts[0].slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      const local = user.email.split('@')[0]
      return local.slice(0, 2).toUpperCase()
    }
    return userInitials
  }

  const handleMenuClick = () => {
    setIsSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const handleNewPost = async () => {
    if (onNewPost) {
      onNewPost()
      return
    }

    try {
      // Get auth providers based on selected channel
      let providers: string[] = []
      let authProviderIds: string[] = []

      console.log('handleNewPost - user:', user)
      console.log('handleNewPost - selectedChannel:', selectedChannel)
      
      if (selectedChannel.id === 'all') {
        // All channels selected - use all user's connected providers
        providers = user?.connectedProviders.map(p => p.provider).filter(Boolean) || []
        authProviderIds = user?.connectedProviders.map(p => p.id).filter(Boolean) || []
      } else if (selectedChannel.provider) {
        // Specific channel selected
        const selectedProvider = user?.connectedProviders.find(p => p.provider === selectedChannel.provider)
        if (selectedProvider && selectedProvider.id) {
          providers = [selectedProvider.provider]
          authProviderIds = [selectedProvider.id]
        }
      }
      
      console.log('handleNewPost - providers:', providers)
      console.log('handleNewPost - authProviderIds:', authProviderIds)

      // Create new post via API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          providers,
          authProviderIds
        })
      })

      if (response.ok) {
        const newPost = await response.json()
        router.push(`/portal/posts/edit/${newPost.id}`)
      } else {
        console.error('Failed to create post')
        // Fallback to old behavior
        router.push('/portal/posts/edit')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      // Fallback to old behavior
      router.push('/portal/posts/edit')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC]">
      <Header 
        onMenuClick={handleMenuClick}
        userInitials={computeInitials()}
        onNewPost={handleNewPost}
      />
      
      {/* Main Content */}
      <div className="flex flex-1 relative max-w-full overflow-hidden min-h-0">
        {/* Mobile Menu Overlay */}
        <div 
          className={cn(
            "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity",
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={handleSidebarClose}
        />
        
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 min-w-0">
          {children}
        </main>
      </div>
      
      {/* Floating Compose Button (Mobile Only) */}
      <FloatingCompose onClick={handleNewPost} />
      
      {/* Mobile Navigation (Bottom) */}
      <MobileNav />
    </div>
  )
}

export function PortalLayout({ children, onNewPost, userInitials = 'JD' }: PortalLayoutProps) {
  return (
    <ApplicationProvider>
      <PortalContent onNewPost={onNewPost} userInitials={userInitials}>
        {children}
      </PortalContent>
    </ApplicationProvider>
  )
}
