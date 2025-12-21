// app/(public)/shop/[slug]/ProductForm.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/lib/data';
import { addToCart } from '@/lib/actions';
import { Minus, Plus, ShoppingBag, Zap, Sparkles } from 'lucide-react';

interface ProductFormProps {
  product: Product;
  variants: ProductVariant[];
}

export default function ProductForm({ product, variants }: ProductFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedLength, setSelectedLength] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);

  const { availableLengths, availableColors } = useMemo(() => {
    if (variants.length > 0) {
      const lengths = Array.from(new Set(variants.map(v => v.length).filter(Boolean) as string[]));
      const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean) as string[]));
      
      return {
        availableLengths: lengths.length > 0 ? lengths : product.length || [],
        availableColors: colors.length > 0 ? colors : product.color || []
      };
    }
    
    return {
      availableLengths: product.length || [],
      availableColors: product.color || []
    };
  }, [variants, product.length, product.color]);

  useEffect(() => {
    if (selectedLength === '' && availableLengths.length > 0) {
      setSelectedLength(availableLengths[0]);
    }
    if (selectedColor === '' && availableColors.length > 0) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableLengths, availableColors, selectedLength, selectedColor]);

  useEffect(() => {
    if (selectedLength && selectedColor && variants.length > 0) {
      const variant = variants.find(
        v => v.length === selectedLength && v.color === selectedColor
      );
      
      if (variant) {
        setSelectedVariant(variant);
        setPrice(variant.price);
        setStock(variant.stock);
      } else {
        setSelectedVariant(null);
        setPrice(product.price);
        setStock(product.stock);
      }
    } else {
      setSelectedVariant(null);
      setPrice(product.price);
      setStock(product.stock);
    }
  }, [selectedLength, selectedColor, variants, product.price, product.stock]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleLengthSelect = (length: string) => {
    setSelectedLength(length);
  };

  const handleAddToCart = async (redirectToCart = false) => {
    if (!session) {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(`/shop/${product.slug}`));
      return;
    }

    if (stock <= 0) {
      alert('This product is out of stock');
      return;
    }

    if (availableLengths.length > 0 && !selectedLength) {
      alert('Please select a length');
      return;
    }

    if (availableColors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    setIsAdding(true);
    try {
      const result = await addToCart({
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
        selectedLength: selectedLength || undefined,
        selectedColor: selectedColor || undefined,
      });

      if (result.success) {
        window.dispatchEvent(new Event('cartUpdated'));
        if (redirectToCart) {
          router.push('/cart');
        } else {
          alert('Product added to cart successfully!');
          setQuantity(1);
        }
      } else {
        alert(result.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const getColorDisplay = (color: string) => {
    if (color.startsWith('#')) return color;
    
    return color
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
      {/* Length Selection */}
      {availableLengths.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Select Length</h3>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {stock > 0 ? `In Stock` : 'Out of Stock'}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {availableLengths.map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => handleLengthSelect(length)}
                className={`py-3 border rounded-xl text-center transition-all duration-300 ${
                  selectedLength === length
                    ? 'border-[#800020] bg-linear-to-r from-[#800020] to-[#b76e79] text-white shadow-md scale-105'
                    : 'border-gray-200 hover:border-[#b76e79] hover:bg-[#f7e7ce]/20 hover:shadow-sm'
                }`}
              >
                <span className="font-medium">{length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select Color</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`relative p-2 border rounded-xl flex flex-col items-center transition-all duration-300 ${
                  selectedColor === color
                    ? 'border-[#800020] ring-2 ring-[#800020]/30 shadow-md scale-105'
                    : 'border-gray-200 hover:border-[#b76e79] hover:shadow-sm'
                }`}
                title={getColorDisplay(color)}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow-inner mb-2"
                  style={{ 
                    backgroundColor: color.startsWith('#') ? color : 
                    color.toLowerCase() === 'black' ? '#000000' :
                    color.toLowerCase() === 'brown' ? '#8B4513' :
                    color.toLowerCase() === 'dark brown' ? '#654321' :
                    color.toLowerCase() === 'light brown' ? '#D2691E' :
                    color.toLowerCase() === 'blonde' ? '#F5DEB3' :
                    color.toLowerCase() === 'burgundy' ? '#800020' :
                    color.toLowerCase() === 'red' ? '#FF0000' :
                    color.toLowerCase() === 'blue' ? '#0000FF' :
                    color.toLowerCase() === 'green' ? '#008000' :
                    '#f0f0f0'
                  }}
                />
                <span className="text-xs font-medium truncate w-full text-center">
                  {getColorDisplay(color)}
                </span>
                
                {selectedColor === color && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-r from-[#800020] to-[#b76e79] rounded-full flex items-center justify-center">
                    <svg 
                      className="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quantity</h3>
        <div className="flex items-center">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={20} />
            </button>
            <div className="w-16 h-12 flex items-center justify-center font-bold text-lg text-gray-900 border-x border-gray-200">
              {quantity}
            </div>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={stock > 0 && quantity >= stock}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="ml-4 text-sm">
            {stock <= 0 ? (
              <span className="text-red-600 font-medium">Out of stock</span>
            ) : quantity > stock ? (
              <span className="text-red-600 font-medium">Only {stock} available</span>
            ) : (
              <span className="text-green-600 font-medium">{stock} available</span>
            )}
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="mb-6 p-5 bg-linear-to-r from-[#f7e7ce]/30 to-[#f5c8c8]/30 rounded-xl border border-white/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 font-medium">Price:</span>
          <span className=" text-base font-bold text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79]">
            ₦{price.toLocaleString()}
          </span>
        </div>
        {quantity > 1 && (
          <div className="flex justify-between items-center text-sm pt-3 border-t border-white/30">
            <span className="text-gray-600">Total ({quantity} items):</span>
            <span className="font-bold text-transparent text-2xl bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79]">
              ₦{(price * quantity).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={stock <= 0 || isAdding}
          className={`group w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            stock > 0
              ? 'bg-linear-to-r from-[#800020] to-[#b76e79] text-white hover:shadow-xl hover:shadow-[#800020]/30 hover:scale-[1.02]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${isAdding ? 'opacity-75 cursor-wait' : ''}`}
        >
          {isAdding ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Adding to Cart...</span>
            </>
          ) : stock > 0 ? (
            <>
              <ShoppingBag size={20} />
              <span>Add to Cart</span>
            </>
          ) : (
            <span>Out of Stock</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={stock <= 0 || isAdding}
          className={`group w-full py-4 border-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            stock > 0
              ? 'border-[#800020] text-[#800020] hover:bg-linear-to-r hover:from-[#800020] hover:to-[#b76e79] hover:text-white hover:shadow-xl hover:shadow-[#800020]/30 hover:scale-[1.02]'
              : 'border-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Zap size={20} className="group-hover:text-white transition-colors" />
          <span>Buy Now</span>
        </button>

        {/* Quick Add */}
        <button
          type="button"
          onClick={() => {
            if (session) {
              handleAddToCart(false);
            } else {
              router.push('/auth/login');
            }
          }}
          disabled={stock <= 0 || isAdding}
          className="w-full py-3 text-sm font-medium text-gray-600 hover:text-[#800020] transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          <span>Quick Add • Express Checkout</span>
        </button>
      </div>
    </div>
  );
}