//app/(public)/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { createOrder } from '@/lib/checkout-actions';
import { getCartItems } from '@/lib/cart-actions';

interface CartItem {
  id: number;
  name: string;
  image: string;
  final_price: number;
  quantity: number;
  selected_length?: string;
  selected_color?: string;
  product_slug?: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    fullName: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: ''
  });
  
  const [notes, setNotes] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Fetch cart items
  useEffect(() => {
    async function loadCart() {
      if (status === 'authenticated') {
        setLoading(true);
        try {
          const items = await getCartItems();
          if (items.length === 0) {
            router.push('/cart');
            return;
          }
          
          setCartItems(items);
          const subtotalValue = items.reduce((sum, item) => 
            sum + (item.final_price * item.quantity), 0
          );
          const shippingValue = subtotalValue > 50000 ? 0 : 2500;
          
          setSubtotal(subtotalValue);
          setShippingFee(shippingValue);
          setTotal(subtotalValue + shippingValue);
        } catch (error) {
          console.error('Error loading cart:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadCart();
  }, [status, router]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (billingAddress.sameAsShipping && name !== 'email' && name !== 'phone') {
      setBillingAddress(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'sameAsShipping') {
      setBillingAddress(prev => ({
        ...prev,
        sameAsShipping: checked,
        fullName: checked ? shippingAddress.fullName : prev.fullName,
        address: checked ? shippingAddress.address : prev.address,
        city: checked ? shippingAddress.city : prev.city,
        state: checked ? shippingAddress.state : prev.state,
        country: checked ? shippingAddress.country : prev.country,
        postalCode: checked ? shippingAddress.postalCode : prev.postalCode
      }));
    } else {
      setBillingAddress(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const orderData = {
        shippingAddress,
        billingAddress,
        notes,
        subtotal,
        shippingFee,
        totalAmount: total
      };
      
      const result = await createOrder(orderData);
      
      if (result.success && result.orderId) {
        window.dispatchEvent(new Event('cartUpdated'));
        router.push(`/checkout/payment/${result.orderId}`);
      } else {
        alert(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#800020]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
      <div className="container mx-auto max-w-350 px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#800020] rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#800020] font-heading mb-3">Complete Your Order</h1>
            <p className="text-gray-600 max-w-md mx-auto">Just a few steps left to get your beautiful hair</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Shipping & Billing */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-soft p-8 border border-[#f5c8c8]/30">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-[#800020] text-white rounded-full flex items-center justify-center mr-3">
                      1
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-[#800020]">Shipping Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingAddress.email}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        placeholder="0800 000 0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        placeholder="Postal code"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        placeholder="Complete street address"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-2xl shadow-soft p-8 border border-[#f5c8c8]/30">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-[#800020] text-white rounded-full flex items-center justify-center mr-3">
                      2
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-[#800020]">Billing Address</h2>
                  </div>
                  <div className="mb-6">
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="sameAsShipping"
                          checked={billingAddress.sameAsShipping}
                          onChange={handleBillingChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${billingAddress.sameAsShipping ? 'bg-[#800020] border-[#800020]' : 'border-gray-300 bg-white'}`}>
                          {billingAddress.sameAsShipping && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="ml-3 font-medium text-gray-700 group-hover:text-[#800020] transition-colors">
                        Same as shipping address
                      </span>
                    </label>
                  </div>
                  
                  {!billingAddress.sameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={billingAddress.fullName}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={billingAddress.state}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={billingAddress.postalCode}
                          onChange={handleBillingChange}
                          className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                          placeholder="Postal code"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={billingAddress.address}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                          placeholder="Complete street address"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={billingAddress.country}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-2xl shadow-soft p-8 border border-[#f5c8c8]/30">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-[#800020] text-white rounded-full flex items-center justify-center mr-3">
                      3
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-[#800020]">Additional Notes</h2>
                  </div>
                  <textarea
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#faf9f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] transition-all duration-300"
                    placeholder="Any special instructions or notes for your order..."
                  />
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-6 border border-[#f5c8c8]/30">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-[#800020] text-white rounded-full flex items-center justify-center mr-3">
                      4
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-[#800020]">Order Summary</h2>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mb-6 max-h-80 overflow-y-auto pr-2">
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start p-3 bg-[#faf9f6] rounded-xl hover:bg-[#f7e7ce] transition-colors duration-300">
                          <div className="w-16 h-16 relative bg-white rounded-lg overflow-hidden shrink-0 shadow-sm">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#f5c8c8] to-[#f7e7ce]">
                                <span className="text-2xl">💇‍♀️</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 grow">
                            <Link 
                              href={`/shop/${item.product_slug || '#'}`}
                              className="font-semibold text-gray-800 hover:text-[#800020] transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <div className="text-sm text-gray-500 mt-1">
                              Qty: {item.quantity}
                              {item.selected_length && ` • Length: ${item.selected_length}`}
                              {item.selected_color && ` • Color: ${item.selected_color}`}
                            </div>
                            <div className="text-[#800020] font-bold mt-1">
                              ₦{(item.final_price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Shipping</span>
                      <span className={`font-semibold ${subtotal > 1000000 ? 'text-green-600' : ''}`}>
                        {subtotal > 1000000 ? 'FREE' : `on delivery`}
                      </span>
                    </div>
                    {subtotal < 50000 && subtotal > 0 && (
                      <div className="p-4 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-xl">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#800020] mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[#800020] font-semibold">
                            Add ₦{(50000 - subtotal).toLocaleString()} more for free shipping!
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="py-4 border-t border-gray-200">
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-gray-800">Total</span>
                        <span className="text-[#800020]">₦{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="mb-6 p-4 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-xl border border-[#f5c8c8]">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-[#800020] text-white rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <span className="font-bold text-gray-800">Bank Transfer</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Complete payment securely via bank transfer on the next page
                    </p>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                  
                  {/* Back to Cart */}
                  <Link
                    href="/cart"
                    className="flex items-center justify-center mt-4 text-[#800020] hover:text-[#a00030] font-medium transition-colors group"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}