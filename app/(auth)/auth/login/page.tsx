//app/(auth)/auth/login/page.tsx - STYLED VERSION
'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('verify')) {
          setError('Please verify your email before logging in. Check your inbox.')
        } else {
          setError('Invalid email or password')
        }
        setLoading(false)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  // const handleSocialLogin = (provider: 'google' | 'facebook') => {
  //   signIn(provider, { callbackUrl: '/' })
  // }

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
          <h1 className="text-3xl font-bold text-[#800020]">Welcome Back</h1>
          <p className="text-gray-600 mt-3">Sign in to your Hair Stop account</p>
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

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📧</span>
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm font-bold text-[#800020] hover:text-[#a00030] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔒</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-[#faf9f6] border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                    placeholder="Enter your password"
                  />
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="p-3 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] border border-[#f5c8c8] text-gray-700 rounded-xl font-medium hover:border-[#800020]/30 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🔵</span>
                  Google
                </button>
              </div>
            </div> */}

            <div className="mt-8 pt-6 border-t border-[#f5c8c8] text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="font-bold text-[#800020] hover:text-[#a00030] transition-colors">
                  Create one now
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