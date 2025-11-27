'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  emailVerified: boolean
  onboardingCompleted: boolean
  role?: string
  interests: string[]
  connectedProviders: Array<{
    id: string
    provider: string
    providerId: string
    connectedAt: string
  }>
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  login: (provider: string, redirectTo?: string) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

// Helper function to clear authentication cookies
// THIS DOES NOTHING, COOKIES ARE SET TO HTTP, CAN ONLY BE CLEANED BY SERVER SIDE set-cookie
const clearAuthCookies = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'automapost_access=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'automapost_refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  
  // Check authentication status
  const checkAuth = useCallback(async (skipRedirect = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        
        // Check if onboarding is incomplete and redirect
        if (userData.onboardingCompleted === false && typeof window !== 'undefined') {
          // Only redirect if not already on onboarding page
          if (!window.location.pathname.includes('/onboarding')) {
            const currentPath = window.location.pathname
            const pathSegments = currentPath.split('/').filter(Boolean)
            const firstSegment = pathSegments[0]
            
            // Check if path has locale prefix (e.g., /en, /es, etc.)
            const hasLocalePrefix = firstSegment && firstSegment.length === 2
            const onboardingPath = hasLocalePrefix ? `/${firstSegment}/onboarding?step=2` : '/onboarding?step=2'
            
            router.push(onboardingPath)
            return
          }
        }
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        })
        
        if (refreshResponse.ok) {
          // Retry getting user data
          const retryResponse = await fetch('/api/auth/me', {
            credentials: 'include'
          })
          
          if (retryResponse.ok) {
            const userData = await retryResponse.json()
            setUser(userData)
            
            // Check if onboarding is incomplete and redirect
            if (userData.onboardingCompleted === false && typeof window !== 'undefined') {
              // Only redirect if not already on onboarding page
              if (!window.location.pathname.includes('/onboarding')) {
                const currentPath = window.location.pathname
                const pathSegments = currentPath.split('/').filter(Boolean)
                const firstSegment = pathSegments[0]
                
                // Check if path has locale prefix (e.g., /en, /es, etc.)
                const hasLocalePrefix = firstSegment && firstSegment.length === 2
                const onboardingPath = hasLocalePrefix ? `/${firstSegment}/onboarding?step=2` : '/onboarding?step=2'
                
                router.push(onboardingPath)
                return
              }
            }
          } else {
            setUser(null)
            clearAuthCookies()
            router.push('/login?error=session_expired')
          }
        } else {
          setUser(null)
          clearAuthCookies()
          router.push('/login?error=session_expired');
        }
      } else {
        setUser(null)
        // Also handle other 4xx errors
        if (!skipRedirect && response.status >= 400 && response.status < 500 && typeof window !== 'undefined' && window.location.pathname.includes('/portal')) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include'
            })
            // Small delay to ensure cookies are cleared
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (error) {
            console.error('Logout failed:', error)
          }
          router.push('/login?error=session_expired')
        }
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setError(err as Error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [router])
  
  // Initial auth check
  useEffect(() => {
    checkAuth(true)
  }, [checkAuth])
  
  // Refresh auth periodically (every 10 minutes)
  useEffect(() => {
    const interval = setInterval(() => checkAuth(false), 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkAuth])
  
  // Login function
  const login = useCallback((provider: string, redirectTo?: string) => {
    const params = new URLSearchParams()
    if (redirectTo) {
      params.append('redirectTo', redirectTo)
    }
    
    const url = `/api/auth/${provider}/login${params.toString() ? `?${params}` : ''}`
    router.push(url)
  }, [router])
  
  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setUser(null)
        router.push('/')
      } else {
        throw new Error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
      setError(err as Error)
      // Clear user anyway
      setUser(null)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])
  
  // Refresh user data
  const refreshUser = useCallback(async () => {
    await checkAuth()
  }, [checkAuth])
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    requireOnboarding?: boolean
  }
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()
    
    useEffect(() => {
      if (!loading && !user) {
        router.push(options?.redirectTo || '/login')
      }
      
      if (!loading && user && options?.requireOnboarding && !user.onboardingCompleted) {
        router.push('/onboarding')
      }
    }, [user, loading, router])
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }
    
    if (!user) {
      return null
    }
    
    return <Component {...props} />
  }
}
