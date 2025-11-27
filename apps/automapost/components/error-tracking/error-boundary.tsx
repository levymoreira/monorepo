'use client'

import React, { Component, ReactNode } from 'react'
import { ErrorType, ErrorSeverity } from '@/lib/types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

interface ErrorReport {
  error: string
  errorType: string
  severity: string
  url: string
  userAgent: string
  metadata: {
    componentStack?: string
    errorBoundary: string
    timestamp: string
    userId?: string
    sessionId?: string
  }
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report the error to our API
    this.reportError(error, errorInfo)
  }

  private async reportError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Get user info from localStorage if available
      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('userId') || undefined 
        : undefined
      
      const sessionId = typeof window !== 'undefined' 
        ? localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId') || undefined 
        : undefined

      const errorReport: ErrorReport = {
        error: `${error.name}: ${error.message}\n${error.stack || 'No stack trace'}`,
        errorType: ErrorType.REACT,
        severity: ErrorSeverity.ERROR,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        metadata: {
          componentStack: errorInfo.componentStack,
          errorBoundary: 'ErrorBoundary',
          timestamp: new Date().toISOString(),
          userId,
          sessionId
        }
      }

      // Only report in production or development when explicitly enabled
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
        console.error('React Error Boundary caught an error:', error)
        console.error('Component Stack:', errorInfo.componentStack)
      }
    } catch (reportingError) {
      // Don't let error reporting crash the app
      console.error('Failed to report error:', reportingError)
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg 
                className="w-6 h-6 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. The error has been reported and we'll look into it.
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined })
                  // Optionally reload the page
                  if (typeof window !== 'undefined') {
                    window.location.reload()
                  }
                }}
                className="btn btn-primary"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Convenience wrapper component
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}