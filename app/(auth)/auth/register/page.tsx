//app/(auth)/auth/register/page.tsx - STYLED VERSION
'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
      } else {
        setSuccess('Registration successful! You can now login to your account.')
        setFormData({ name: '', email: '', password: '', phone: '' })
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <Image
              src="/images/logo1.png"
              alt="Hair Stop Logo"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#800020]">Create Account</h1>
          <p className="text-gray-600 mt-3">Join our premium hair community</p>
        </div>

        <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-3xl shadow-2xl overflow-hidden border border-[#f5c8c8]/30">
          <div className="p-8 sm:p-10">
            {error && (
              <div className="mb-6 p-4 bg-linear-to-r from-red-50 to-red-100 border border-red-200 rounded-xl text-red-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-red-600">⚠️</span>
                  </div>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-linear-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl text-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-emerald-600">✅</span>
                  </div>
                  <span>{success}</span>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">👤</span>
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📱</span>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Must be at least 6 characters long</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-xs text-gray-500 text-center space-y-2">
                <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                {/* <p className="text-[#800020] font-medium">
                  After registration, you&apos;ll receive a verification email. You must verify your email before logging in.
                </p> */}
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#f5c8c8] text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-bold text-[#800020] hover:text-[#a00030] transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#800020] hover:text-[#a00030] font-semibold transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}