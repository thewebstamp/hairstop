// app/(public)/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getCartItems, removeFromCart, updateCartQuantity } from '@/lib/cart-actions';
import { Trash2, Plus, Minus, ShoppingBag, Truck, CreditCard, ArrowRight, Package, Star } from 'lucide-react';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/cart');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCart();
    }
  }, [status]);

  async function fetchCart() {
    setLoading(true);
    try {
      const items = await getCartItems();
      setCartItems(items);
      calculateSubtotal(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function calculateSubtotal(items: any[]) {
    const total = items.reduce((sum, item) => {
      return sum + (item.final_price * item.quantity);
    }, 0);
    setSubtotal(total);
    // Free shipping for orders over 1,000,000
    setShippingCost(total > 1000000 ? 0 : 0);
  }

  async function handleUpdateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) return;

    try {
      await updateCartQuantity(itemId, newQuantity);
      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      calculateSubtotal(updatedItems);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  async function handleRemoveItem(itemId: number) {
    try {
      await removeFromCart(itemId);
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      calculateSubtotal(updatedItems);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  // Function to get actual color from color name
  const getColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'black': '#000000',
      'brown': '#8B4513',
      'dark brown': '#654321',
      'light brown': '#D2691E',
      'blonde': '#F5DEB3',
      'burgundy': '#800020',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'purple': '#800080',
      'pink': '#FFC0CB',
      'gray': '#808080',
      'white': '#FFFFFF',
      'auburn': '#A52A2A',
      'caramel': '#D2691E',
      'honey': '#FFC30B',
      'platinum': '#E5E4E2',
      'silver': '#C0C0C0',
      'golden': '#FFD700',
      'ash': '#B2BEB5',
      'chocolate': '#7B3F00'
    };

    const lowerColor = colorName.toLowerCase();
    return colorMap[lowerColor] || colorName.startsWith('#') ? colorName : '#f0f0f0';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-[#faf9f6]">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#f7e7ce] border-t-[#800020] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-[#800020] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-[#faf9f6]">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-linear-to-r from-white/50 to-[#f7e7ce]/30 rounded-xl w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-48 bg-linear-to-r from-white/50 to-[#f7e7ce]/30 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-linear-to-br from-white/50 to-[#faf9f6]/30 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="relative min-h-screen bg-linear-to-b from-white to-[#faf9f6] overflow-hidden">
        {/* Elegant Hair Strands Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {/* Curved hair strands */}
          <div className="absolute top-1/4 left-1/4 w-64 h-px bg-linear-to-r from-transparent via-[#b76e79] to-transparent transform -rotate-12"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-px bg-linear-to-r from-transparent via-[#800020] to-transparent transform rotate-6"></div>
          <div className="absolute top-1/2 left-1/3 w-56 h-px bg-linear-to-r from-transparent via-[#f5c8c8] to-transparent transform rotate-3"></div>
          <div className="absolute bottom-1/3 right-1/3 w-72 h-px bg-linear-to-r from-transparent via-[#b76e79] to-transparent transform -rotate-8"></div>
          <div className="absolute bottom-1/4 left-1/2 w-40 h-px bg-linear-to-r from-transparent via-[#f5c8c8] to-transparent transform rotate-12"></div>

          {/* Wavy strands */}
          <div className="absolute top-40 right-40 w-80 h-1">
            <div className="w-full h-full bg-linear-to-r from-transparent via-[#800020]/30 to-transparent"
              style={{ clipPath: 'path("M0,50 Q100,0 200,50 T400,50 T600,50")' }}></div>
          </div>
          <div className="absolute bottom-40 left-40 w-80 h-1">
            <div className="w-full h-full bg-linear-to-r from-transparent via-[#b76e79]/30 to-transparent"
              style={{ clipPath: 'path("M0,50 Q100,100 200,50 T400,50 T600,50")' }}></div>
          </div>
        </div>

        <div className="container mx-auto max-w-350 px-4 md:px-6 py-12 sm:py-16 relative z-10">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto rounded-full border-2 border-[#f7e7ce] bg-linear-to-b from-white to-[#faf9f6] flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-16 h-16 text-[#800020]" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8 text-lg">Add some amazing hair products to your cart!</p>

            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 bg-linear-to-r from-[#800020] to-[#b76e79] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Star className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = subtotal + shippingCost;

  return (
    <div className="relative min-h-screen bg-linear-to-b from-white to-[#faf9f6] overflow-hidden">
      {/* Ultra-Modern Hair Strands Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Modern curved lines */}
        <div className="absolute top-20 left-10 w-96 h-0.5 bg-linear-to-r from-transparent via-[#800020] to-transparent transform -rotate-12"></div>
        <div className="absolute top-40 right-20 w-80 h-0.5 bg-linear-to-r from-transparent via-[#b76e79] to-transparent transform rotate-6"></div>
        <div className="absolute top-60 left-32 w-64 h-0.5 bg-linear-to-r from-transparent via-[#f5c8c8] to-transparent transform rotate-3"></div>
        <div className="absolute bottom-40 right-32 w-72 h-0.5 bg-linear-to-r from-transparent via-[#800020] to-transparent transform -rotate-8"></div>
        <div className="absolute bottom-20 left-40 w-56 h-0.5 bg-linear-to-r from-transparent via-[#b76e79] to-transparent transform rotate-12"></div>

        {/* Wavy modern strands */}
        <div className="absolute top-1/3 left-20 w-64 h-1">
          <div className="w-full h-full bg-linear-to-r from-transparent via-[#800020]/40 to-transparent"
            style={{ clipPath: 'path("M0,25 Q50,0 100,25 T200,25 T300,25")' }}></div>
        </div>
        <div className="absolute bottom-1/3 right-20 w-64 h-1">
          <div className="w-full h-full bg-linear-to-r from-transparent via-[#b76e79]/40 to-transparent"
            style={{ clipPath: 'path("M0,25 Q50,50 100,25 T200,25 T300,25")' }}></div>
        </div>
      </div>

      <div className="container mx-auto max-w-350 px-4 md:px-6 py-8 md:py-12 relative z-10">
        {/* Header with Bold Typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 bg-linear-to-b from-[#800020] to-[#b76e79] rounded-full"></div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Shopping Cart
              </h1>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="font-medium">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>Total: <span className="font-bold text-[#800020]">₦{total.toLocaleString()}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#800020]" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">Items</div>
              <div className="text-xl font-bold text-gray-900">{cartItems.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items - Ultra Modern Design */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="group relative overflow-hidden bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl transition-all duration-300">
                {/* Accent Border - hidden on mobile to save space */}
                <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-[#800020] to-[#b76e79]"></div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Product Image - Compact for mobile */}
                    <div className="relative shrink-0 flex sm:block">
                      <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-lg sm:rounded-xl overflow-hidden border border-gray-100 bg-white shadow-xs sm:shadow-sm shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 640px) 80px, (max-width: 768px) 128px, 160px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8]">
                            <div className="text-2xl sm:text-3xl">💇‍♀️</div>
                          </div>
                        )}
                      </div>

                      {/* Stock Badge - smaller on mobile */}
                      <div className="absolute top-1 right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Product Details - Mobile optimized layout */}
                    <div className="grow">
                      <div className="flex flex-col h-full">
                        {/* Mobile Top Row: Title + Unit Price side by side */}
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <Link href={`/shop/${item.product_slug || '#'}`} className="flex-1 pr-2">
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 hover:text-[#800020] transition-colors duration-300 line-clamp-2 sm:line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="text-right shrink-0">
                            <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Unit</div>
                            <div className="text-lg sm:text-xl font-bold text-[#800020]">
                              ₦{item.final_price?.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Color and Length Display - Compact for mobile */}
                        {(item.selected_color || item.selected_length) && (
                          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                            {item.selected_color && (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-200 shadow-sm shrink-0"
                                  style={{ backgroundColor: getColorHex(item.selected_color) }}
                                  title={item.selected_color}
                                ></div>
                                <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize truncate max-w-20 sm:max-w-none">
                                  {item.selected_color}
                                </span>
                              </div>
                            )}

                            {item.selected_length && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-linear-to-b from-[#800020] to-[#b76e79] rounded-full shrink-0"></div>
                                <span className="text-xs sm:text-sm font-medium text-gray-700">
                                  {item.selected_length}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bottom Section: Quantity and Actions - Mobile optimized */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                          {/* Left side: Quantity controls + Remove */}
                          <div className="flex items-center justify-between sm:justify-start sm:gap-6">
                            <div className="flex items-center bg-white border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-xs sm:shadow-sm">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <div className="w-12 sm:w-16 h-10 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg text-gray-900 border-x border-gray-200">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>

                            {/* Remove Button - Mobile positioning */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 transition-colors duration-300 group/remove ml-2 sm:ml-0"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover/remove:scale-110 transition-transform" />
                            </button>
                          </div>

                          {/* Right side: Item Total - Mobile optimized */}
                          <div className="text-right sm:text-right">
                            <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Item Total</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">
                              ₦{(item.final_price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping - Mobile optimized */}
            <div className="pt-4 sm:pt-6">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 sm:gap-3 text-gray-700 hover:text-[#800020] transition-colors duration-300"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#800020] transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 group-hover:text-[#800020]" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-lg">Continue Shopping</div>
                  <div className="text-xs sm:text-sm text-gray-500">Discover more premium hair products</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Order Summary - Modern Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-[#800020]/5 to-transparent"></div>

                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-linear-to-b from-[#800020] to-[#b76e79] rounded-full"></div>
                  <span>Order Summary</span>
                </h2>

                {/* Summary Items */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#800020]" />
                      <span className="text-gray-600">Shipping</span>
                    </div>
                    <span className={`text-base font-semibold ${shippingCost === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {shippingCost === 0 ? 'FREE' : `On delivery`}
                    </span>
                  </div>

                  {/* Free Shipping Progress */}
                  {subtotal > 0 && subtotal < 1000000 && (
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-gray-900">
                          Free Shipping Progress
                        </div>
                        <div className="text-lg font-bold text-[#800020]">
                          {Math.round((subtotal / 1000000) * 100)}%
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#f5c8c8] via-[#b76e79] to-[#800020] rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((subtotal / 1000000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-3">
                        Add <span className="font-bold text-[#800020]">₦{(1000000 - subtotal).toLocaleString()}</span> more for free shipping!
                      </div>
                    </div>
                  )}
                </div>

                {/* Total - Bold and Prominent */}
                <div className="mb-8 p-5 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce]/50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-900">Total Amount</div>
                    <div className="text-[22px] font-black text-[#800020]">
                      ₦{total.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-3">
                    {shippingCost === 0 ? '🎉 Free shipping included!' : 'Shipping fee payable on delivery'}
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => router.push('/checkout')}
                  className="cursor-pointer w-full py-4 rounded-xl bg-linear-to-r from-[#800020] to-[#b76e79] text-white font-bold text-lg hover:shadow-2xl hover:shadow-[#800020]/30 transition-all duration-500 flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Security & Trust */}
                <div className="mt-4 pt-6 border-t border-gray-100">
                  {/* Important Shipping Note */}
                  <div className="mt-6 p-4 bg-linear-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-blue-800 mb-1">Shipping Information</div>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Shipping fees are payable upon delivery when your products arrive at your address.
                          Free shipping applies to orders above ₦1,000,000.
                        </p>
                      </div>
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