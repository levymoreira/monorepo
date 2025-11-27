'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className="w-full min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create account</h1>
            <p className="text-gray-500">Start creating AI-powered LinkedIn content</p>
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
              <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                  data-testid="signup-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                  data-testid="signup-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={6}
                  className="h-12 pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
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
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" aria-hidden="true" />
                Must be at least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 cursor-pointer"
              data-testid="signup-submit"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href={`/${locale}/terms`} className="text-blue-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href={`/${locale}/privacy`} className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          {/* Login Link */}
          <div className="pt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
