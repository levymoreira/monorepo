'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'

export default function SignupPageClient() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      // Redirect to onboarding or portal
      router.push(`/${locale}/onboarding?step=2`)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8 hero-grid-bg">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center space-y-6">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-dark tracking-tight">Create account</h1>
            <p className="text-neutral-gray">Start creating AI-powered LinkedIn content</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2" data-testid="signup-error">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-dark font-medium">Full Name</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="input w-full h-12 !pl-12 bg-white border-gray-200 focus:border-primary transition-all duration-200"
                  data-testid="signup-name"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="input w-full h-12 !pl-12 bg-white border-gray-200 focus:border-primary transition-all duration-200"
                  data-testid="signup-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-dark font-medium">Password</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={6}
                  className="input w-full h-12 !pl-12 pr-10 bg-white border-gray-200 focus:border-primary transition-all duration-200"
                  data-testid="signup-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-neutral-gray flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" aria-hidden="true" />
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-12 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              data-testid="signup-submit"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-dark/30 border-t-neutral-dark rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
            
            <p className="text-xs text-center text-neutral-gray">
              By creating an account, you agree to our{' '}
              <Link href={`/${locale}/terms`} className="text-neutral-dark hover:text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href={`/${locale}/privacy`} className="text-neutral-dark hover:text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          {/* Login Link */}
          <div className="pt-4 text-center">
            <p className="text-sm text-neutral-gray">
              Already have an account?{' '}
              <Link href={`/${locale}/login`} className="text-neutral-dark hover:text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
