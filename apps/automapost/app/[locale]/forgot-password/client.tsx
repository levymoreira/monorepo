'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordClient() {
  const params = useParams()
  const locale = params.locale as string
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8 hero-grid-bg">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-dark tracking-tight">Check your email</h1>
              <p className="text-neutral-gray">
                If an account exists with <span className="font-medium text-neutral-dark">{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 text-neutral-dark px-4 py-3 rounded-xl text-sm">
              <p className="font-medium mb-1">Didn't receive the email?</p>
              <p className="text-neutral-gray">
                Check your spam folder or{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="underline hover:text-primary font-medium"
                >
                  try again
                </button>
              </p>
            </div>

            <div className="pt-4">
              <Link 
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 text-neutral-dark hover:text-primary font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8 hero-grid-bg">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-dark tracking-tight">Forgot password?</h1>
            <p className="text-neutral-gray">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-dark font-medium">Email address</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  required
                  disabled={loading}
                  className="input w-full h-12 !pl-12 bg-white border-gray-200 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-12 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-dark/30 border-t-neutral-dark rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <div className="pt-4">
            <Link 
              href={`/${locale}/login`}
              className="inline-flex items-center gap-2 text-sm text-neutral-gray hover:text-neutral-dark font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
