'use client'

import { useEffect, useRef } from 'react'
import { ErrorType, ErrorSeverity } from '@/lib/types'

interface ErrorReport {
  error: string
  errorType: string
  severity: string
  url: string
  userAgent: string
  metadata: {
    timestamp: string
    userId?: string
    sessionId?: string
    [key: string]: any
  }
}

export default function GlobalErrorHandler() {
  const reportedErrors = useRef(new Set<string>())

  const reportError = async (errorReport: ErrorReport) => {
    try {
      // Create a hash of the error to prevent duplicates
      const errorHash = `${errorReport.errorType}-${errorReport.error.substring(0, 100)}-${errorReport.url}`
      
      // Skip if we've already reported this error recently
      if (reportedErrors.current.has(errorHash)) {
        return
      }

      // Add to reported errors set
      reportedErrors.current.add(errorHash)
      
      // Clean up old error hashes after 5 minutes
      setTimeout(() => {
        reportedErrors.current.delete(errorHash)
      }, 5 * 60 * 1000)

      // Only report in production or when explicitly enabled
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true') {
        await fetch('/api/error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        })
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Global error caught:', errorReport)
      }
    } catch (reportingError) {
      // Don't let error reporting crash the app
      console.error('Failed to report error:', reportingError)
    }
  }

  const getCommonMetadata = () => {
    const userId = typeof window !== 'undefined' 
      ? localStorage.getItem('userId') || undefined 
      : undefined
    
    const sessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId') || undefined 
      : undefined

    return {
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      viewport: typeof window !== 'undefined' 
        ? `${window.innerWidth}x${window.innerHeight}` 
        : undefined,
      screen: typeof window !== 'undefined' 
        ? `${screen.width}x${screen.height}` 
        : undefined
    }
  }

  useEffect(() => {
    // Handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const errorReport: ErrorReport = {
        error: `${event.error?.name || 'Error'}: ${event.message}\n${event.error?.stack || `at ${event.filename}:${event.lineno}:${event.colno}`}`,
        errorType: ErrorType.JAVASCRIPT,
        severity: ErrorSeverity.ERROR,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        metadata: {
          ...getCommonMetadata(),
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      }

      reportError(errorReport)
    }

    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      let errorMessage = 'Unknown promise rejection'
      
      if (event.reason instanceof Error) {
        errorMessage = `${event.reason.name}: ${event.reason.message}\n${event.reason.stack || ''}`
      } else if (typeof event.reason === 'string') {
        errorMessage = event.reason
      } else if (event.reason && typeof event.reason === 'object') {
        errorMessage = JSON.stringify(event.reason, null, 2)
      }

      const errorReport: ErrorReport = {
        error: errorMessage,
        errorType: ErrorType.UNHANDLED_PROMISE,
        severity: ErrorSeverity.ERROR,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        metadata: {
          ...getCommonMetadata(),
          reason: event.reason,
          promiseRejection: true,
        }
      }

      reportError(errorReport)
    }

    // Handler for resource loading errors (images, scripts, etc.)
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement & { src?: string; href?: string }
      const resourceUrl = target?.src || target?.href || 'unknown'
      const tagName = target?.tagName || 'unknown'

      const errorReport: ErrorReport = {
        error: `Failed to load resource: ${resourceUrl}`,
        errorType: ErrorType.NETWORK,
        severity: ErrorSeverity.WARNING,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        metadata: {
          ...getCommonMetadata(),
          resourceUrl,
          tagName: tagName.toLowerCase(),
          resourceType: 'static',
        }
      }

      reportError(errorReport)
    }

    // Add event listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Capture resource loading errors
    document.addEventListener('error', handleResourceError, true)

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      document.removeEventListener('error', handleResourceError, true)
    }
  }, [])

  // Optional: Monitor console errors in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalConsoleError = console.error
      
      console.error = (...args: any[]) => {
        // Call original console.error
        originalConsoleError.apply(console, args)
        
        // Report console errors that look like they might be unhandled
        const errorMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        
        // Skip reporting our own error reports and common development warnings
        if (
          !errorMessage.includes('Failed to report error') &&
          !errorMessage.includes('Warning:') &&
          !errorMessage.includes('Download the React DevTools') &&
          errorMessage.length > 10 // Skip very short messages
        ) {
          const errorReport: ErrorReport = {
            error: `Console Error: ${errorMessage}`,
            errorType: ErrorType.JAVASCRIPT,
            severity: ErrorSeverity.WARNING,
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
            metadata: {
              ...getCommonMetadata(),
              source: 'console.error',
              development: true,
            }
          }
          
          reportError(errorReport)
        }
      }
      
      return () => {
        console.error = originalConsoleError
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}