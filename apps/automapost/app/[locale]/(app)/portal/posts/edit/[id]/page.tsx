'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, Sparkles, Check, X, Edit3, Calendar as CalendarIcon } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScheduleDialog } from '@/components/portal/schedule-dialog/schedule-dialog'
import { format } from 'date-fns'
import { TertiaryButton, PrimaryButton } from '@/components/portal/button/button'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { ChatInput } from '@/components/portal/chat-input/chat-input'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const { user } = useAuth()
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mobile tab state (Chat | Post)
  const [mobileTab, setMobileTab] = useState<'chat' | 'post'>('chat')

  // Use the chat hook for real-time chat functionality
  const { 
    messages, 
    sendMessage, 
    generateFollowUp, 
    isConnected, 
    isTyping,
    isSending,
    isLoading: chatIsLoading 
  } = useChat(postId)
  
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const chatFileInputRef = useRef<HTMLInputElement | null>(null)

  // Post editor state
  const [postText, setPostText] = useState('')
  const [firstComment, setFirstComment] = useState('')
  const [scheduledTo, setScheduledTo] = useState<Date>(() => {
    const d = new Date()
    d.setHours(d.getHours() + 1, 0, 0, 0)
    return d
  })
  const [timeString, setTimeString] = useState<string>(() => format(new Date(new Date().setHours(new Date().getHours() + 1, 0, 0, 0)), 'HH:mm'))
  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState<'DRAFT' | 'SCHEDULED' | 'PENDING_APPROVAL' | 'SENT'>('DRAFT')
  const [providers, setProviders] = useState<string[]>([])
  const [authProviderIds, setAuthProviderIds] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const userInitials = useMemo(() => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/)
      return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'AP'
    }
    if (user?.email) {
      const local = user.email.split('@')[0]
      return (local[0] || 'A').toUpperCase() + (local[1] || 'P').toUpperCase()
    }
    return 'AP'
  }, [user])

  const handleScheduleChange = (newDate: Date) => {
    setScheduledTo(newDate)
    setTimeString(format(newDate, 'HH:mm'))
    setHasUnsavedChanges(true)
  }

  // Load existing post
  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found')
          } else if (response.status === 401) {
            router.push('/login')
            return
          } else {
            setError('Failed to load post')
          }
          setIsLoading(false)
          return
        }

        const post = await response.json()
        
        console.log('loadExistingPost - post data loaded:', post)
        console.log('loadExistingPost - post.providers:', post.providers)
        console.log('loadExistingPost - post.authProviderIds:', post.authProviderIds)
        
        // Update state with loaded post data
        setPostText(post.content || '')
        setFirstComment(post.firstComment || '')
        setStatus(post.status || 'DRAFT')
        setProviders(post.providers || [])
        setAuthProviderIds(post.authProviderIds || [])
        
        if (post.scheduledTo) {
          const scheduledDate = new Date(post.scheduledTo)
          setScheduledTo(scheduledDate)
          setTimeString(format(scheduledDate, 'HH:mm'))
        }
        
        // Chat messages are now loaded automatically via useChat hook
      } catch (error) {
        console.error('Error loading post:', error)
        setError('Failed to load post')
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [postId, router])

  // Auto-scroll chat to bottom when messages change or typing indicator appears
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])
  
  // Track unsaved changes
  useEffect(() => {
    if (!isLoading) {
      setHasUnsavedChanges(true)
    }
  }, [postText, firstComment, scheduledTo, timeString, status, providers, authProviderIds, isLoading])

  const savePost = async (saveAsDraft = true) => {
    try {
      console.log('savePost - providers:', providers)
      console.log('savePost - authProviderIds:', authProviderIds)
      
      const data = {
        content: postText,
        firstComment: firstComment,
        scheduledTo: scheduledTo.toISOString(),
        status: saveAsDraft ? 'DRAFT' : 'SCHEDULED',
        providers,
        authProviderIds
      }
      
      console.log('savePost - data being sent:', data)

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      setHasUnsavedChanges(false)
      return true
    } catch (error) {
      console.error('Error saving post:', error)
      setError('Failed to save post')
      return false
    }
  }

  const onSaveDraft = async () => {
    const success = await savePost(true)
    if (success) {
      router.push('/portal/posts')
    }
  }

  const onSchedule = async () => {
    const success = await savePost(false)
    if (success) {
      router.push('/portal/posts')
    }
  }

  const handleBack = async () => {
    if (hasUnsavedChanges) {
      // Check if the post is empty (no content)
      const isEmptyPost = !postText.trim() && !firstComment.trim()
      
      if (isEmptyPost) {
        const shouldDiscard = window.confirm('This post has no content. Do you want to discard it?')
        if (shouldDiscard) {
          // Soft delete the empty post
          try {
            await fetch(`/api/posts/${postId}`, {
              method: 'DELETE',
              credentials: 'include'
            })
          } catch (error) {
            console.error('Error deleting empty post:', error)
          }
        } else {
          return // User chose to keep editing
        }
      } else {
        const shouldLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?')
        if (!shouldLeave) return
      }
    }
    router.push('/portal/posts')
  }

  // Handle sending messages through the chat
  const handleSend = async () => {
    if (!chatInput.trim()) return
    await sendMessage(chatInput.trim())
    setChatInput('')
  }
  
  // Trigger AI follow-up when post content changes (with debounce)
  useEffect(() => {
    if (postText.length > 10 && !isLoading) {
      generateFollowUp(postText)
    }
  }, [postText, generateFollowUp, isLoading])

  const handleAddImages = (files: FileList | null) => {
    if (!files) return
    const readers: Promise<string>[] = []
    Array.from(files).forEach((file) => {
      const reader = new Promise<string>((resolve) => {
        const fr = new FileReader()
        fr.onload = () => resolve(fr.result as string)
        fr.readAsDataURL(file)
      })
      readers.push(reader)
    })
    Promise.all(readers).then((urls) => setImages((prev) => [...prev, ...urls]))
  }

  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  // Keep scheduledTo date and timeString in sync
  useEffect(() => {
    const [hours, minutes] = timeString.split(':').map((p) => parseInt(p, 10))
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      const d = new Date(scheduledTo)
      d.setHours(hours, minutes, 0, 0)
      setScheduledTo(d)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeString])

  const formattedDate = useMemo(() => `${format(scheduledTo, 'PPP')} ${timeString}`, [scheduledTo, timeString])
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white md:bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0078D4] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Loading post...</p>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-white md:bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/portal/posts')}
            className="px-4 py-2 bg-[#0078D4] text-white rounded-lg hover:bg-[#005A9E] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white md:bg-[#F8FAFC]">
      {/* Header */}
      <div className="h-14 md:h-16 border-b border-[#DADDE1] bg-white">
        <div className="h-full w-full flex items-center px-3 md:px-6 md:max-w-6xl md:mx-auto">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1E21]" />
          </button>
          <div className="ml-2 hidden md:flex items-center justify-between flex-grow">
            <h1 className="text-lg md:text-xl font-semibold text-[#1C1E21]">Edit Post</h1>
            <div className="flex gap-2">
              <TertiaryButton size="md" onClick={onSaveDraft}>Save Draft</TertiaryButton>
              <PrimaryButton size="md" onClick={onSchedule}>Schedule</PrimaryButton>
            </div>
          </div>
          {/* Mobile Tabs in header */}
          <div className="ml-2 flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileTab('chat')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                mobileTab === 'chat' ? 'bg-[#EBF4FF] text-[#0078D4] font-semibold' : 'text-[#6B7280]'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setMobileTab('post')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                mobileTab === 'post' ? 'bg-[#EBF4FF] text-[#0078D4] font-semibold' : 'text-[#6B7280]'
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-56px)] md:h-[calc(100%-64px)]">
        <div className="h-full w-full md:max-w-6xl md:mx-auto md:px-6 flex md:py-6 relative">
          {/* Custom divider with padding */}
          <div className="hidden md:block absolute left-1/2 top-[5%] bottom-[5%] w-[1px] bg-[#EAECF0] transform -translate-x-1/2 z-10"></div>
          {/* Chat (left) */}
          <section
            className={`flex-1 max-w-full md:max-w-[50%] ${
              mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
            } flex-col bg-white md:rounded-l-2xl md:shadow-[-10px_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] md:border-t md:border-b md:border-l md:border-[#DADDE1] overflow-hidden`}
          >
          <div className="flex-1 overflow-y-auto p-3 md:p-4 md:pt-[38px] space-y-4">
            {/* Connection status indicator */}
            {!isConnected && (
              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Connecting to chat...</p>
              </div>
            )}
            
            {/* Show loading state if no messages and chat is loading */}
            {chatIsLoading && messages.length === 0 && (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0078D4] mx-auto mb-2"></div>
                <p className="text-sm text-[#6B7280]">Loading chat messages...</p>
              </div>
            )}
            
            {messages.map((m) => {
              const isUser = m.role === 'user'
              return (
                <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {/* Assistant avatar on left, User avatar on right */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#1C1E21] font-bold text-sm flex-shrink-0">
                      A
                    </div>
                  )}

                  <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm md:text-base whitespace-pre-wrap ${
                        isUser ? 'bg-[#EBF4FF] text-[#1C1E21]' : 'bg-[#F8FAFC] text-[#1C1E21]'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#EBF4FF] text-[#0078D4] flex items-center justify-center font-bold text-sm flex-shrink-0">
                      You
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#1C1E21] font-bold text-sm flex-shrink-0">
                  A
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 md:p-4">
            <ChatInput
              value={chatInput}
              onChange={setChatInput}
              onSend={handleSend}
              onFilesSelected={handleAddImages}
              loading={isSending}
              className=""
            />
          </div>
          </section>

          {/* Post Editor (right) */}
          <section
            className={`flex-1 max-w-full md:max-w-[50%] ${
              mobileTab === 'post' ? 'flex' : 'hidden md:flex'
            } flex-col bg-white md:rounded-r-2xl md:shadow-[10px_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] md:border-t md:border-b md:border-r md:border-[#DADDE1] overflow-hidden`}
          >
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            <div className="bg-white rounded-xl border border-[#DADDE1] shadow-sm md:border-0 md:shadow-none">
              {/* Editor header: user + inline date link (replaces Public) */}
              <div className="p-4 flex items-center justify-start">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10">
                    {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user?.name || 'User'} /> : null}
                    <AvatarFallback className="font-bold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C1E21] truncate">{user?.name || 'AutomaPost User'}</p>
                    <ScheduleDialog 
                      scheduledTo={scheduledTo}
                      onScheduleChange={handleScheduleChange}
                      formattedDate={formattedDate}
                    />
                  </div>
                </div>
              </div>

              {/* Editor textarea */}
              <div className="px-4 pb-4 pt-0 -mt-2">
                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What do you want to talk about?"
                  className="min-h-[160px] md:min-h-[220px] resize-y"
                />
                {/* Faux engagement (moved directly under content) */}
                <div className="mt-3 text-xs text-[#6B7280]">0 likes • 0 comments • 0 shares</div>

                {/* Image upload (now after engagement) */}
                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#DADDE1] hover:bg-[#F8FAFC] text-sm text-[#1C1E21] cursor-pointer">
                    <ImageIcon className="w-4 h-4 text-[#0078D4]" />
                    <span>Add images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleAddImages(e.target.files)}
                      className="hidden"
                    />
                  </label>

                  {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2">
                      {images.map((url) => (
                        <div key={url} className="relative group border border-[#DADDE1] rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Selected" className="w-full h-24 object-cover" />
                          <button
                            onClick={() => handleRemoveImage(url)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions - mobile only */}
          <div className="bg-white p-3 md:p-4 flex md:hidden justify-end gap-2">
            <TertiaryButton size="lg" onClick={onSaveDraft}>Save Draft</TertiaryButton>
            <PrimaryButton size="lg" onClick={onSchedule}>Schedule</PrimaryButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}