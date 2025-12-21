// app/(public)/components/UserMenu.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { User, ChevronDown } from 'lucide-react';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted before rendering (SSR safety)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted || status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!session) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 border border-[#800020] text-[#800020] rounded-md hover:bg-[#800020] hover:text-white transition-colors duration-300 font-medium"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none group"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full bg-[#f7e7ce] flex items-center justify-center hover:bg-[#f5c8c8] transition-colors duration-300 border border-[#f5c8c8]">
          <User className="w-5 h-5 text-[#800020]" />
        </div>
        <span className="hidden md:inline text-[15px] lg:text-[17px] font-medium text-gray-700 group-hover:text-[#800020] transition-colors">
          {session.user?.name?.split(' ')[0] || 'Account'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-[#f7e7ce]">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#f7e7ce]">
            <p className="text-[16px] lg:text-[17px] font-semibold text-[#800020] truncate">{session.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/account"
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#faf9f6] hover:text-[#800020] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Account
            </Link>

            <Link
              href="/orders"
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#faf9f6] hover:text-[#800020] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Orders
            </Link>

            {session.user?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#faf9f6] hover:text-[#800020] transition-colors border-t border-[#f7e7ce] mt-1"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-[#f7e7ce] pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-[#faf9f6] transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}