'use client'

import { useEffect, useState } from 'react'
import { PortalLayout } from '@/components/portal/layout/portal-layout'
import { Tabs, Tab } from '@/components/portal/tabs/tabs'
import { ViewSwitcher } from '@/components/portal/view-switcher/view-switcher'
import { QueueEmptyState, EmptyState } from '@/components/portal/empty-state/empty-state'
import { PostListItem } from '@/components/portal/post-list-item/post-list-item'
import { Facebook, Instagram, Linkedin, CheckCircle2, Send } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useChannel } from '@/contexts/ApplicationContext'
import { isDevelopment } from '@/lib/env'

type Post = {
  id: string
  content: string
  status: string
  createdAt: string
  scheduledTo?: string
  providers: string[]
  authProviderIds: string[]
}

type PostCounts = {
  SCHEDULED: number
  DRAFT: number
  PENDING_APPROVAL: number
  SENT: number
}

export default function PostsPage() {
  const { user, loading } = useAuth()
  const { selectedChannel } = useChannel()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [activeTab, setActiveTab] = useState('scheduled')
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list')
  const [isCapacityDialogOpen, setIsCapacityDialogOpen] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [postCounts, setPostCounts] = useState<PostCounts>({ SCHEDULED: 0, DRAFT: 0, PENDING_APPROVAL: 0, SENT: 0 })
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fetch all posts and calculate counts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const allPosts = await response.json()
      setPosts(allPosts)
      
      // Calculate counts for each status
      const counts = allPosts.reduce((acc: PostCounts, post: Post) => {
        const status = post.status as keyof PostCounts
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, { SCHEDULED: 0, DRAFT: 0, PENDING_APPROVAL: 0, SENT: 0 })
      
      setPostCounts(counts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoadingPosts(false)
    }
  }
  
  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`)
    }
  }, [loading, user, router, locale])
  
  // Load posts when user is authenticated
  useEffect(() => {
    if (!loading && user) {
      fetchPosts()
    }
  }, [loading, user])
  
  useEffect(() => {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : ''
      const isProdDomain = host === 'automapost.com' || host.endsWith('.automapost.com')
      setIsCapacityDialogOpen(isProdDomain)
    } catch {
      setIsCapacityDialogOpen(false)
    }
  }, [])
  
  // Filter posts by active tab
  const getFilteredPosts = () => {
    const statusMap = {
      'scheduled': 'SCHEDULED',
      'drafts': 'DRAFT', 
      'approvals': 'PENDING_APPROVAL',
      'sent': 'SENT'
    }
    
    const targetStatus = statusMap[activeTab as keyof typeof statusMap]
    return posts.filter(post => post.status === targetStatus)
  }
  
  // Get platform info based on providers
  const getPlatformInfo = (providers: string[]) => {
    if (providers.length === 1) {
      const provider = providers[0].toLowerCase()
      switch (provider) {
        case 'facebook':
          return {
            name: 'Facebook',
            icon: <Facebook className="w-5 h-5" />,
            color: 'text-[#1877F2]',
            bgColor: 'bg-blue-50'
          }
        case 'instagram':
          return {
            name: 'Instagram',
            icon: <Instagram className="w-5 h-5" />,
            color: 'text-[#E4405F]',
            bgColor: 'bg-pink-50'
          }
        case 'linkedin':
          return {
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            color: 'text-[#0A66C2]',
            bgColor: 'bg-blue-50'
          }
        default:
          return {
            name: 'Social Media',
            icon: <Send className="w-5 h-5" />,
            color: 'text-[#0078D4]',
            bgColor: 'bg-[#EBF4FF]'
          }
      }
    }
    
    // Multiple providers
    return {
      name: `${providers.length} Platforms`,
      icon: <Send className="w-5 h-5" />,
      color: 'text-[#0078D4]',
      bgColor: 'bg-[#EBF4FF]'
    }
  }
  
  // Get status message based on post status and dates
  const getStatusMessage = (post: Post) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    switch (post.status) {
      case 'SCHEDULED':
        return `Scheduled to ${formatDate(post.scheduledTo || post.createdAt)}`
      case 'SENT':
        return `Published at ${formatDate(post.createdAt)}`
      case 'PENDING_APPROVAL':
        return `Updated at ${formatDate(post.createdAt)}`
      case 'DRAFT':
      default:
        return `Draft saved ${formatDate(post.createdAt)}`
    }
  }

  // Handle delete post confirmation
  const handleDeletePost = (postId: string) => {
    setDeletePostId(postId)
  }

  // Confirm and delete post
  const confirmDeletePost = async () => {
    if (!deletePostId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${deletePostId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        // Remove the post from local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== deletePostId))
        
        // Recalculate counts
        const updatedPosts = posts.filter(post => post.id !== deletePostId)
        const counts = updatedPosts.reduce((acc: PostCounts, post: Post) => {
          const status = post.status as keyof PostCounts
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, { SCHEDULED: 0, DRAFT: 0, PENDING_APPROVAL: 0, SENT: 0 })
        setPostCounts(counts)
        
        setDeletePostId(null)
      } else {
        console.error('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Cancel delete
  const cancelDeletePost = () => {
    setDeletePostId(null)
  }
  
  const tabs: Tab[] = [
    { id: 'scheduled', label: 'Scheduled', count: postCounts.SCHEDULED },
    { id: 'drafts', label: 'Drafts', count: postCounts.DRAFT },
    { id: 'approvals', label: 'Approvals', count: postCounts.PENDING_APPROVAL },
    { id: 'sent', label: 'Sent', count: postCounts.SENT }
  ]

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  const renderTabContent = () => {
    const filteredPosts = getFilteredPosts()
    
    if (isLoadingPosts) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )
    }
    
    switch (activeTab) {
      case 'scheduled':
        return filteredPosts.length === 0 ? (
          <QueueEmptyState onSchedulePost={() => {}} />
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostListItem
                key={post.id}
                platform={getPlatformInfo(post.providers)}
                timeAgo={getStatusMessage(post)}
                content={post.content || 'No content'}
                characterCount={post.content?.length || 0}
                onEdit={() => router.push(`/portal/posts/edit/${post.id}`)}
                onDelete={() => handleDeletePost(post.id)}
                onSchedule={() => router.push(`/portal/posts/edit/${post.id}`)}
                status={post.status}
              />
            ))}
          </div>
        )
      
      case 'drafts':
        return filteredPosts.length === 0 ? (
          <EmptyState
            title="No drafts"
            description="Start creating some posts to see them here."
            primaryAction={{
              label: "Create Post",
              onClick: () => {} // Will be handled by PortalLayout
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostListItem
                key={post.id}
                platform={getPlatformInfo(post.providers)}
                timeAgo={getStatusMessage(post)}
                content={post.content || 'No content'}
                characterCount={post.content?.length || 0}
                onEdit={() => router.push(`/portal/posts/edit/${post.id}`)}
                onDelete={() => handleDeletePost(post.id)}
                onSchedule={() => router.push(`/portal/posts/edit/${post.id}`)}
                status={post.status}
              />
            ))}
          </div>
        )
      
      case 'approvals':
        return filteredPosts.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-16 h-16 text-[#0078D4]" />}
            title="No pending approvals"
            description="All your posts have been approved and are ready to publish."
          />
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostListItem
                key={post.id}
                platform={getPlatformInfo(post.providers)}
                timeAgo={getStatusMessage(post)}
                content={post.content || 'No content'}
                characterCount={post.content?.length || 0}
                onEdit={() => router.push(`/portal/posts/edit/${post.id}`)}
                onDelete={() => handleDeletePost(post.id)}
                onSchedule={() => router.push(`/portal/posts/edit/${post.id}`)}
                status={post.status}
              />
            ))}
          </div>
        )
      
      case 'sent':
        return filteredPosts.length === 0 ? (
          <EmptyState
            icon={<Send className="w-16 h-16 text-[#0078D4]" />}
            title="No sent posts"
            description="Your published content will appear here. Check Analytics for detailed insights."
          />
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostListItem
                key={post.id}
                platform={getPlatformInfo(post.providers)}
                timeAgo={getStatusMessage(post)}
                content={post.content || 'No content'}
                characterCount={post.content?.length || 0}
                onEdit={() => router.push(`/portal/posts/edit/${post.id}`)}
                onDelete={() => handleDeletePost(post.id)}
                onSchedule={() => router.push(`/portal/posts/edit/${post.id}`)}
                editButtonText="View Details"
                status={post.status}
              />
            ))}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <PortalLayout>
      <Dialog open={isCapacityDialogOpen} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>We're currently at capacity</DialogTitle>
            <DialogDescription>
              We've reached our maximum capacity at the moment and are onboarding new users gradually.
              We'll contact you by email as soon as a spot opens. Current ETA: 3 days.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePostId} onOpenChange={cancelDeletePost}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={cancelDeletePost} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePost} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="max-w-full mx-auto p-4 md:p-6">
        {/* Content Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1C1E21]">Content Queue</h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Switcher - Hidden in production */}
              {isDevelopment() && (
                <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
              )}
            </div>
          </div>
          
          {/* Status Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {renderTabContent()}
        </div>
      </div>
    </PortalLayout>
  )
}