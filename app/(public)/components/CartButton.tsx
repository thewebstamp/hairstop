// app/(public)/components/CartButton.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { getCartItems } from '@/lib/actions';

export default function CartButton() {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart count using server action
  const fetchCartCount = async () => {
    try {
      const cartItems = await getCartItems();
      console.log('Cart items from server action:', cartItems); // For debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and setup
  useEffect(() => {
    fetchCartCount();

    // Listen for custom events when cart is updated
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Also fetch when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCartCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-full hover:bg-[#f5c8c8] transition-colors duration-300 group"
      aria-label={`Shopping cart ${cartCount > 0 ? `with ${cartCount} items` : ''}`}
    >
      <ShoppingCart className="w-6 h-6 text-[#800020] group-hover:text-[#b76e79] transition-colors duration-300" />

      {/* ALWAYS show cart count when not loading */}
      {!isLoading && (
        <span className={`absolute -top-1 -right-1 min-w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center px-1 ${
          cartCount > 0 
            ? 'bg-[#b76e79] text-white animate-pulse-once' 
            : 'bg-[#f7e7ce] text-[#800020]'
        }`}>
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}

      {/* Loading state */}
      {isLoading && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 rounded-full animate-pulse"></span>
      )}

      {/* Desktop tooltip */}
      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#800020] text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        {cartCount === 0 ? 'Cart is empty' : `Cart (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
      </span>
    </Link>
  );
}