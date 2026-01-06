// app/(public)/orders/[orderId]/page.tsx - STYLED VERSION
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderDetails } from '@/lib/checkout-actions';

const statusSteps = [
  { key: 'pending', label: 'Pending Payment', icon: '⏳' },
  { key: 'payment_pending', label: 'Payment Review', icon: '👁️' },
  { key: 'processing', label: 'Processing', icon: '⚙️' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '📬' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200 text-yellow-800',
  payment_pending: 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200 text-blue-800',
  processing: 'bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200 text-purple-800',
  confirmed: 'bg-gradient-to-r from-green-100 to-green-50 border-green-200 text-green-800',
  shipped: 'bg-gradient-to-r from-indigo-100 to-indigo-50 border-indigo-200 text-indigo-800',
  delivered: 'bg-gradient-to-r from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-800',
};

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.orderId as string);
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && orderId) {
      fetchOrder();
    }
  }, [status, orderId, router]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const orderData = await getOrderDetails(orderId);
      if (!orderData) {
        router.push('/orders');
        return;
      }
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#800020] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
        <div className="text-center bg-white rounded-2xl p-8 border border-[#f5c8c8] shadow-sm max-w-md">
          <div className="w-20 h-20 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link 
            href="/orders" 
            className="inline-flex items-center justify-center bg-linear-to-r from-[#800020] to-[#a00030] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] transition-all duration-300"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
  const shippingAddress = order.shipping_address;
  const billingAddress = order.billing_address;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link 
              href="/orders" 
              className="inline-flex items-center text-[#800020] hover:text-[#a00030] font-medium transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold font-heading text-[#800020]">Order #{order.order_number}</h1>
                  <p className="text-gray-600 mt-2">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${statusColors[order.status] || 'bg-linear-to-r from-gray-100 to-gray-50 border border-gray-200 text-gray-800'}`}>
                      {statusSteps.find(s => s.key === order.status)?.label || order.status}
                    </span>
                    <div className="text-sm text-gray-500">
                      ID: {order.order_number}
                    </div>
                  </div>
                </div>
              </div>
              
              {order.status === 'pending' && (
                <Link
                  href={`/checkout/payment/${order.id}`}
                  className="inline-flex items-center justify-center bg-linear-to-r from-[#800020] to-[#a00030] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete Payment
                </Link>
              )}
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold font-heading text-[#800020] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              Order Status
            </h2>
            
            <div className="relative mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-2">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500 ${
                      index <= currentStepIndex
                        ? 'bg-linear-to-r from-[#800020] to-[#a00030] border-[#800020] text-white shadow-md scale-110'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <span className="text-lg mb-1">{step.icon}</span>
                      <div className="text-[10px] font-bold mt-1">{step.label.split(' ')[0]}</div>
                    </div>
                    <div className="text-xs mt-3 text-center font-medium text-gray-700 hidden sm:block">
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-8 mb-6">
                <div 
                  className="absolute top-0 left-0 h-full bg-linear-to-r from-[#800020] to-[#a00030] transition-all duration-1000"
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {statusSteps.find(s => s.key === order.status)?.label}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {order.status === 'payment_pending' ? (
                    'We are reviewing your payment proof. This usually takes 1min - 24hrs.'
                  ) : order.status === 'shipped' ? (
                    'Your order is on the way! Track your package for delivery updates.'
                  ) : order.status === 'delivered' ? (
                    'Your order has been successfully delivered. Enjoy your purchase!'
                  ) : (
                    'Your order is being processed with care.'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#f5c8c8] bg-linear-to-r from-[#faf9f6] to-[#f7e7ce]">
                  <h2 className="text-2xl font-bold font-heading text-[#800020] flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    Order Items ({order.items?.length || 0})
                  </h2>
                </div>
                <div className="divide-y divide-[#f5c8c8]">
                  {order.items?.map((item: any, index: number) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 hover:bg-[#faf9f6] transition-colors duration-300">
                      <div className="relative w-full sm:w-24 h-24 bg-white rounded-xl border border-[#f5c8c8] overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8]">
                            <span className="text-2xl">💇‍♀️</span>
                          </div>
                        )}
                      </div>
                      <div className="grow">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div>
                            <Link 
                              href={`/shop/${item.slug || '#'}`}
                              className="text-lg font-bold text-gray-900 hover:text-[#800020] transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <div className="flex flex-wrap gap-3 mt-2">
                              {item.selected_color && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-5 h-5 rounded-full border border-gray-200"
                                    style={{ backgroundColor: item.selected_color.includes('#') ? item.selected_color : '#f5c8c8' }}
                                    title={item.selected_color}
                                  ></div>
                                  <span className="text-sm text-gray-600 capitalize">
                                    {item.selected_color}
                                  </span>
                                </div>
                              )}
                              {item.selected_length && (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-4 bg-linear-to-b from-[#800020] to-[#b76e79] rounded-full"></div>
                                  <span className="text-sm text-gray-600">
                                    {item.selected_length}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Price × Quantity</div>
                            <div className="text-lg font-bold text-[#800020]">
                              ₦{item.price.toLocaleString()} × {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-[#f5c8c8]">
                          <div className="text-sm text-gray-600">
                            Item Total
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Billing Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                      <span className="text-lg">🚚</span>
                    </div>
                    <h2 className="text-xl font-bold font-heading text-[#800020]">Shipping Address</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#faf9f6] rounded-xl">
                      <p className="font-bold text-gray-900 text-lg">{shippingAddress.fullName}</p>
                      <p className="text-gray-700">{shippingAddress.address}</p>
                      <p className="text-gray-700">{shippingAddress.city}, {shippingAddress.state}</p>
                      <p className="text-gray-700">{shippingAddress.country}</p>
                      {shippingAddress.postalCode && (
                        <p className="text-gray-700">Postal Code: {shippingAddress.postalCode}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="p-3 bg-[#faf9f6] rounded-xl flex-1">
                        <div className="text-sm text-gray-600 mb-1">Phone</div>
                        <div className="font-medium text-gray-900">{shippingAddress.phone}</div>
                      </div>
                      <div className="p-3 bg-[#faf9f6] rounded-xl flex-1">
                        <div className="text-sm text-gray-600 mb-1">Email</div>
                        <div className="font-medium text-gray-900">{shippingAddress.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                      <span className="text-lg">💰</span>
                    </div>
                    <h2 className="text-xl font-bold font-heading text-[#800020]">Billing Address</h2>
                  </div>
                  <div className="space-y-3">
                    {billingAddress.sameAsShipping ? (
                      <div className="p-6 bg-linear-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl text-center">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                          ✓
                        </div>
                        <p className="font-bold text-emerald-800">Same as shipping address</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#faf9f6] rounded-xl">
                        <p className="font-bold text-gray-900 text-lg">{billingAddress.fullName}</p>
                        <p className="text-gray-700">{billingAddress.address}</p>
                        <p className="text-gray-700">{billingAddress.city}, {billingAddress.state}</p>
                        <p className="text-gray-700">{billingAddress.country}</p>
                        {billingAddress.postalCode && (
                          <p className="text-gray-700">Postal Code: {billingAddress.postalCode}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl border border-[#f5c8c8] shadow-sm p-6 sticky top-6">
                <h2 className="text-2xl font-bold font-heading text-[#800020] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-xl flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-[#f5c8c8]">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#f5c8c8]">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className={`font-medium ${order.shipping_fee === 0 ? 'text-emerald-600' : ''}`}>
                      {order.subtotal > 1000000 ? 'FREE' : `On delivery`}
                    </span>
                  </div>
                  <div className="py-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-[#800020]">₦{order.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6 pt-6 border-t border-[#f5c8c8]">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    Payment Method
                  </h3>
                  <div className="p-4 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-xl border border-[#f5c8c8]">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-full flex items-center justify-center mr-3">
                        ₦
                      </div>
                      <span className="font-bold text-gray-900">Bank Transfer</span>
                    </div>
                    {order.proof_of_payment_url && (
                      <a
                        href={order.proof_of_payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full mt-3 px-4 py-2 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-lg font-semibold hover:shadow-sm hover:scale-[1.02] transition-all duration-300"
                      >
                        <span className="mr-2">👁️</span>
                        View Payment Proof
                      </a>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                {order.notes && (
                  <div className="mb-6 pt-6 border-t border-[#f5c8c8]">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">📝</span>
                      Order Notes
                    </h3>
                    <div className="p-4 bg-[#faf9f6] rounded-xl border border-[#f5c8c8]">
                      <p className="text-gray-700 italic">{order.notes}</p>
                    </div>
                  </div>
                )}

                {/* Support Contact */}
                <div className="pt-6 border-t border-[#f5c8c8]">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">❓</span>
                    Need Help?
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                      <div className="font-medium text-blue-800 mb-1">Email Support</div>
                      <div className="text-blue-700">Hairstopwigsandextentions@ gmail.com</div>
                    </div>
                    <div className="p-3 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="font-medium text-green-800 mb-1">WhatsApp</div>
                      <div className="text-green-700">+234 903 698 1564</div>
                    </div>
                    <div className="p-3 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] border border-[#f5c8c8] rounded-xl">
                      <div className="font-medium text-gray-800 mb-1">Order Reference</div>
                      <div className="font-mono text-sm text-gray-700">#{order.order_number}</div>
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