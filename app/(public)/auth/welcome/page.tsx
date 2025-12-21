/* eslint-disable react-hooks/purity */
// app/(public)/auth/welcome/page.tsx - STYLED VERSION
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#800020] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Welcome to Hair Stop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <Image
              src="/images/hairstop.jpg"
              alt="Hair Stop Logo"
              width={96}
              height={96}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#800020] mb-3">
            Welcome to Hair Stop
          </h1>
          <p className="text-lg text-gray-600">
            Premium Hair Solutions, Just for You
          </p>
        </div>

        <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-3xl shadow-2xl overflow-hidden border border-[#f5c8c8]/30">
          {/* Celebration Header */}
          <div className="relative h-40 bg-linear-to-r from-[#800020] to-[#a00030] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center px-6">
                <div className="text-6xl mb-2">🎉</div>
                <h2 className="text-3xl font-bold text-[#faf9f6]/90">Welcome, {session?.user?.name}!</h2>
                <p className="text-white/90 mt-2"></p>
              </div>
            </div>
            
            {/* Celebration Particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>

          <div className="px-8 py-10">
            <div className="text-center mb-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-r from-emerald-100 to-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Your account has been successfully created. We&apos;re excited to have you join our premium hair community!
              </p>
            </div>

            <div className="space-y-8">
              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/shop"
                  className="group relative overflow-hidden bg-linear-to-r from-[#800020] to-[#a00030] text-white px-6 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-[#800020]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🛍️</span>
                  Start Shopping
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                
                <Link
                  href="/account"
                  className="group relative overflow-hidden bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-gray-800 px-6 py-4 rounded-2xl font-bold border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">👤</span>
                  My Account
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-6 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] border-t border-[#f5c8c8]">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Need assistance? Contact our support team at{' '}
                <a href="mailto:support@hairstop.ng" className="font-bold text-[#800020] hover:text-[#a00030] transition-colors">
                  support@hairstop.ng
                </a>
              </p>
              <p className="text-xs text-gray-500">
                You&apos;re receiving this because you recently created an account at Hair Stop.
              </p>
            </div>
          </div>
        </div>

        {/* Continue to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#800020] hover:text-[#a00030] font-semibold transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}