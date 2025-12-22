// app/(auth)/auth/reset-password/page.tsx - STYLED VERSION
'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setError('Invalid reset link. Please request a new password reset.')
      setTokenValid(false)
    }
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`)
      const data = await response.json()
      
      if (response.ok && data.valid) {
        setTokenValid(true)
      } else {
        setError('Invalid or expired reset token. Please request a new password reset.')
        setTokenValid(false)
      }
    } catch (error) {
      setError('Failed to validate token. Please try again.')
      setTokenValid(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to reset password')
      } else {
        setMessage(data.message || 'Password reset successfully!')
        setPassword('')
        setConfirmPassword('')
        
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-t-3 border-b-3 border-[#800020]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Validating reset link...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
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
          </div>

          <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-3xl shadow-2xl overflow-hidden border border-[#f5c8c8]/30">
            <div className="p-8 sm:p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-r from-red-100 to-red-50 border-4 border-red-200 rounded-full flex items-center justify-center">
                <span className="text-3xl text-red-600">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-8">
                {error || 'This password reset link is invalid or has expired.'}
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Request New Reset Link
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-gray-800 px-6 py-4 rounded-xl font-bold border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-lg transition-all duration-300"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <Image
              src="/images/hairstop.jpg"
              alt="Hair Stop Logo"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#800020]">New Password</h1>
          <p className="text-gray-600 mt-3">Create a new password for your account</p>
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

            {message && (
              <div className="mb-6 p-4 bg-linear-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl text-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-emerald-600">✅</span>
                  </div>
                  <span>{message}</span>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    New Password *
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                      placeholder="Re-enter your password"
                    />
                  </div>
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
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#f5c8c8] text-center">
              <Link
                href="/auth/login"
                className="font-bold text-[#800020] hover:text-[#a00030] transition-colors"
              >
                Back to sign in
              </Link>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-t-3 border-b-3 border-[#800020]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading reset link...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}