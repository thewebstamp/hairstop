// app/(public)/auth/verify-email/page.tsx - STYLED VERSION
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token]);

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
          <h1 className="text-3xl font-bold text-[#800020]">Email Verification</h1>
        </div>

        <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-3xl shadow-2xl overflow-hidden border border-[#f5c8c8]/30">
          <div className="p-8 sm:p-10">
            {status === 'loading' && (
              <div className="text-center py-8">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-3 border-b-3 border-[#800020]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">📧</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Verifying Your Email</h3>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-emerald-100 to-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
                <p className="text-gray-600 mb-8">{message}</p>
                <div className="space-y-4">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Go to Login
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-gray-800 px-6 py-4 rounded-xl font-bold border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-lg transition-all duration-300"
                  >
                    Go to Homepage
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-red-100 to-red-50 border-4 border-red-200 rounded-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h3>
                <p className="text-gray-600 mb-8">{message}</p>
                <div className="space-y-4">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Try Again
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-gray-800 px-6 py-4 rounded-xl font-bold border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-lg transition-all duration-300"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
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
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6">
              <div className="animate-spin rounded-full h-24 w-24 border-t-3 border-b-3 border-[#800020]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">📧</span>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Loading...</h3>
          <p className="text-gray-600">Preparing verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}