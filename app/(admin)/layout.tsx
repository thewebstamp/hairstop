// app/(admin)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag,
  LogOut,
  BarChart,
  Bell,
  Search,
  UserCircle,
  ChevronDown
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin');
      return;
    }

    if (status === 'authenticated') {
      if (session.user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, show nothing (will redirect)
  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: Home,
      badge: null 
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingCart,
      badge: '12' 
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: Package,
      badge: null 
    },
    { 
      name: 'Categories', 
      href: '/admin/categories', 
      icon: Tag,
      badge: null 
    },
    { 
      name: 'Customers', 
      href: '/admin/customers', 
      icon: Users,
      badge: null 
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: BarChart,
      badge: 'New' 
    },
  ];

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - Fixed at top */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">HS</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Hair Stop
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
                </div>
              </Link>
            </div>

            {/* Right: Search, Notifications, User menu */}
            <div className="flex items-center space-x-3">
              {/* Search - Desktop */}
              <div className="hidden md:block relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Mobile search button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <Search className="h-5 w-5 text-gray-600" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    {session.user.name?.charAt(0) || 'A'}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* User dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{session.user.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{session.user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/admin/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation Bar - Below header (Same for all devices) */}
          <div className="border-t border-gray-200">
            <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-hide">
              <div className="flex items-center space-x-1 w-full min-w-max">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        relative flex flex-col items-center px-3 py-2 rounded-lg min-w-[70px] transition-all duration-200 flex-shrink-0
                        ${active 
                          ? 'text-primary' 
                          : 'text-gray-600 hover:text-primary'
                        }
                      `}
                    >
                      {/* Active indicator - Colored bottom bar */}
                      {active && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" />
                      )}
                      
                      <div className="relative">
                        <item.icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-gray-500'}`} />
                        
                        {/* Badge */}
                        {item.badge && (
                          <span className={`
                            absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center rounded-full font-bold
                            ${active 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-200 text-gray-800'
                            }
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      
                      {/* Text */}
                      <span className={`text-xs font-medium mt-1.5 ${active ? 'text-primary font-semibold' : ''}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="p-4 md:p-6">
        {children}
      </main>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}