// app/(public)/orders/page.tsx - STYLED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserOrders } from '@/lib/checkout-actions';

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

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/orders');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const userOrders = await getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#800020] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Separate orders into pending and completed
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
          {/* Header Section */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#800020]">My Orders</h1>
                  <p className="text-gray-600 mt-1">Track and manage all your purchases</p>
                </div>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-linear-to-r from-[#800020] to-[#a00030] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Continue Shopping
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

          {orders.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl sm:text-5xl">📦</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">No orders yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Your order history will appear here once you start shopping</p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-linear-to-r from-[#800020] to-[#a00030] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Orders Section */}
              {pendingOrders.length > 0 && (
                <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#f5c8c8] bg-linear-to-r from-[#faf9f6] to-[#f7e7ce]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold font-heading text-[#800020] flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                            <span className="text-lg">⏳</span>
                          </div>
                          Pending Orders ({pendingOrders.length})
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Orders that are being processed or awaiting payment</p>
                      </div>
                      <div className="hidden sm:block px-4 py-2 bg-white border border-[#f5c8c8] rounded-xl text-sm font-medium text-gray-700">
                        Requires Action
                      </div>
                    </div>
                  </div>
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
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider hidden md:table-cell">
                            Items
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5c8c8]">
                        {pendingOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#faf9f6] transition-colors duration-300">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-gray-900">#{order.order_number}</div>
                              <div className="text-xs text-gray-500 sm:hidden mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 hidden sm:table-cell">
                              <div className="flex flex-col">
                                <div>{new Date(order.created_at).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
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
                              <div className="font-bold text-[#800020]">
                                ₦{order.total_amount.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusColors[order.status] || 'bg-linear-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'}`}>
                                {statusLabels[order.status] || order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Link
                                  href={`/orders/${order.id}`}
                                  className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-[#800020] font-semibold rounded-lg border border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-sm transition-all duration-300 whitespace-nowrap"
                                >
                                  View
                                </Link>
                                {order.status === 'pending' && (
                                  <Link
                                    href={`/checkout/payment/${order.id}`}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-[#800020] to-[#a00030] text-white font-semibold rounded-lg hover:shadow-sm hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
                                  >
                                    Pay Now
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Completed Orders Section */}
              {completedOrders.length > 0 && (
                <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#f5c8c8] bg-linear-to-r from-[#faf9f6] to-[#f7e7ce]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold font-heading text-[#800020] flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                            <span className="text-lg">✅</span>
                          </div>
                          Completed Orders ({completedOrders.length})
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Orders that have been shipped or delivered</p>
                      </div>
                    </div>
                  </div>
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
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider hidden md:table-cell">
                            Items
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#800020] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5c8c8]">
                        {completedOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#faf9f6] transition-colors duration-300">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-gray-900">#{order.order_number}</div>
                              <div className="text-xs text-gray-500 sm:hidden mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 hidden sm:table-cell">
                              <div className="flex flex-col">
                                <div>{new Date(order.created_at).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
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
                              <div className="font-bold text-[#800020]">
                                ₦{order.total_amount.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusColors[order.status] || 'bg-linear-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'}`}>
                                {statusLabels[order.status] || order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                href={`/orders/${order.id}`}
                                className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-[#800020] font-semibold rounded-lg border border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-sm transition-all duration-300"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}