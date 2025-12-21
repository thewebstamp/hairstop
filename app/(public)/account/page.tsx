// app/(public)/account/page.tsx - STYLED VERSION
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserOrders } from '@/lib/checkout-actions';

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  item_count: number;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  last_login: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/account');
    }

    if (status === 'authenticated') {
      fetchAccountData();
    }
  }, [status, router]);

  async function fetchAccountData() {
    setLoading(true);
    try {
      const userOrders = await getUserOrders();
      setOrders(userOrders || []);

      if (session?.user) {
        setProfile({
          name: session.user.name || '',
          email: session.user.email || '',
          phone: null,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200',
    payment_pending: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200',
    processing: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200',
    confirmed: 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200',
    shipped: 'bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-800 border border-indigo-200',
    delivered: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200',
    cancelled: 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending Payment',
    payment_pending: 'Payment Pending Review',
    processing: 'Processing',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#800020] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completedOrders = orders.filter(order =>
    order.status === 'delivered' || order.status === 'shipped'
  );

  const pendingOrders = orders.filter(order =>
    order.status !== 'delivered' && order.status !== 'shipped'
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#800020]">My Account</h1>
                <p className="text-gray-600 mt-2">Welcome back, <span className="font-semibold text-[#800020]">{session?.user?.name}</span>!</p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-linear-to-r from-white to-[#faf9f6] border border-[#f5c8c8] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#800020]">{orders.length}</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="w-12 h-12 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-xl flex items-center justify-center">
                    <span className="text-xl">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-white to-[#faf9f6] border border-[#f5c8c8] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#800020]">{pendingOrders.length}</div>
                    <div className="text-sm text-gray-600">Pending Orders</div>
                  </div>
                  <div className="w-12 h-12 bg-linear-to-r from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">⏳</span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-white to-[#faf9f6] border border-[#f5c8c8] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#800020]">{completedOrders.length}</div>
                    <div className="text-sm text-gray-600">Completed Orders</div>
                  </div>
                  <div className="w-12 h-12 bg-linear-to-r from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-6 sticky top-6">
                {/* Profile Info */}
                <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-[#f5c8c8]">
                  <div className="w-24 h-24 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-full flex items-center justify-center font-bold text-3xl mb-4 shadow-md">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{session?.user?.name}</h3>
                    <p className="text-gray-600 mt-1">{session?.user?.email}</p>
                  </div>

                  {/* Profile Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                    <div className="p-3 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-xl text-center">
                      <div className="text-sm font-medium text-gray-600">Member Since</div>
                      <div className="text-xs font-semibold text-[#800020] mt-1">{formatDate(new Date().toISOString())}</div>
                    </div>
                    <div className="p-3 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-xl text-center">
                      <div className="text-sm font-medium text-gray-600">Last Login</div>
                      <div className="text-xs font-semibold text-[#800020] mt-1">Today</div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 mb-8">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Dashboard
                  </h4>

                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl font-medium hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🏠</span>
                    </div>
                    <span>Dashboard</span>
                    <span className="ml-auto text-white/70">→</span>
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-linear-to-r hover:from-[#faf9f6] hover:to-[#f7e7ce] hover:text-[#800020] rounded-xl font-medium transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-lg flex items-center justify-center group-hover:bg-linear-to-r group-hover:from-[#800020] group-hover:to-[#a00030] group-hover:text-white transition-all duration-300">
                      <span className="text-lg">📦</span>
                    </div>
                    <span>My Orders</span>
                    <span className="ml-auto text-gray-400 group-hover:text-[#800020]">→</span>
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-linear-to-r hover:from-[#faf9f6] hover:to-[#f7e7ce] hover:text-[#800020] rounded-xl font-medium transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-lg flex items-center justify-center group-hover:bg-linear-to-r group-hover:from-[#800020] group-hover:to-[#a00030] group-hover:text-white transition-all duration-300">
                      <span className="text-lg">🛒</span>
                    </div>
                    <span>Shopping Cart</span>
                    <span className="ml-auto text-gray-400 group-hover:text-[#800020]">→</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Recent Orders Section */}
              <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#f5c8c8] bg-linear-to-r from-[#faf9f6] to-[#f7e7ce]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                        <span className="text-xl">📊</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold font-heading text-[#800020]">Recent Orders</h2>
                        <p className="text-sm text-gray-600 mt-1">Your latest order history</p>
                      </div>
                    </div>

                    {orders.length > 0 && (
                      <Link
                        href="/orders"
                        className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
                      >
                        View All Orders
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 px-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl sm:text-5xl">📦</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Your order history will appear here once you start shopping</p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center bg-linear-to-r from-[#800020] to-[#a00030] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-linear-to-r from-[#faf9f6] to-[#f7e7ce]">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Order #
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider hidden sm:table-cell">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider hidden md:table-cell">
                            Items
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5c8c8]">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-[#faf9f6] transition-colors duration-300">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/orders/${order.id}`}
                                className="font-bold text-gray-900 hover:text-[#800020] transition-colors"
                              >
                                #{order.order_number}
                              </Link>
                              <div className="text-xs text-gray-500 sm:hidden mt-1">
                                {formatDateTime(order.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 hidden sm:table-cell">
                              <div className="flex flex-col">
                                <div>{formatDate(order.created_at)}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-[#800020]">
                                ₦{order.total_amount.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusColors[order.status] || 'bg-linear-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'}`}>
                                {statusLabels[order.status] || order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 hidden md:table-cell">
                              <div className="flex items-center">
                                <span className="bg-[#f5c8c8] text-[#800020] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                                  {order.item_count}
                                </span>
                                {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/orders/${order.id}`}
                                className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-[#800020] font-semibold rounded-lg border border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-sm transition-all duration-300 whitespace-nowrap"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Show More Link */}
                    {orders.length > 5 && (
                      <div className="p-6 border-t border-[#f5c8c8] text-center">
                        <Link
                          href="/orders"
                          className="inline-flex items-center text-[#800020] hover:text-[#a00030] font-semibold transition-colors"
                        >
                          Show all {orders.length} orders
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/shop"
                  className="group bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-8 hover:shadow-xl hover:border-[#800020]/30 hover:scale-[1.02] transition-all duration-500"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] text-[#800020] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-gradient-to-r group-hover:from-[#800020] group-hover:to-[#a00030] group-hover:text-white transition-all duration-500">
                      🛍️
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#800020] transition-colors">Continue Shopping</h3>
                    <p className="text-gray-600 mb-6">Browse our latest premium hair collection</p>
                    <div className="px-6 py-3 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 transition-all duration-300">
                      Shop Now
                    </div>
                  </div>
                </Link>

                <Link
                  href="/cart"
                  className="group bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-8 hover:shadow-xl hover:border-[#800020]/30 hover:scale-[1.02] transition-all duration-500"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] text-[#800020] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-gradient-to-r group-hover:from-[#800020] group-hover:to-[#a00030] group-hover:text-white transition-all duration-500">
                      🛒
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#800020] transition-colors">Shopping Cart</h3>
                    <p className="text-gray-600 mb-6">Review and checkout your selected items</p>
                    <div className="px-6 py-3 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 transition-all duration-300">
                      View Cart
                    </div>
                  </div>
                </Link>
              </div>

              {/* Account Summary */}
              <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-6">
                <h3 className="text-xl font-bold text-[#800020] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                  Account Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-xl border border-[#f5c8c8]">
                    <div className="text-sm text-gray-600 mb-2">Account Status</div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="font-bold text-gray-900">Active</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-4">Member since {formatDate(new Date().toISOString())}</div>
                  </div>

                  <div className="p-6 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-xl border border-[#f5c8c8]">
                    <div className="text-sm text-gray-600 mb-2">Last Activity</div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="font-bold text-gray-900">Today</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-4">Account accessed just now</div>
                  </div>
                </div>

                {/* Support Contact */}
                <div className="mt-8 pt-6 border-t border-[#f5c8c8]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Need Assistance?</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="font-medium text-blue-800 mb-1">Email Support</div>
                      <div className="text-blue-700">support@hairstop.ng</div>
                    </div>
                    <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="font-medium text-green-800 mb-1">WhatsApp</div>
                      <div className="text-green-700">+234 903 698 1564</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}