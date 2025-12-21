// app/(public)/shop/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProductBySlug, getProductVariants } from '@/lib/data';
import ProductForm from './ProductForm';
import ProductReviews from './ProductReviews';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Truck, Clock, Check, Award, Package } from 'lucide-react';
import ProductImageGallery from './ProductImageGallery';

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(decodeURIComponent(slug));

  if (!product) {
    return {
      title: 'Product Not Found | HairStop',
      description: 'The requested product could not be found.',
    };
  }

  const keywords = [
    product.name,
    product.category_name,
    'human hair',
    product.hair_type,
    product.texture,
    'hair bundles',
    'wigs',
    'frontals',
    'closures',
    'Nigeria',
    'Lagos',
    'African hair'
  ]
    .filter((keyword): keyword is string =>
      keyword !== null && keyword !== undefined && keyword.trim() !== ''
    )
    .map(keyword => keyword.toString());

  return {
    title: `${product.name} | HairStop`,
    description: product.description || `Buy ${product.name} - Premium ${product.category_name} hair at HairStop`,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.images && product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const product = await getProductBySlug(decodedSlug);

  if (!product) {
    console.log('Product not found for slug:', decodedSlug);
    notFound();
  }

  const variants = await getProductVariants(product.id);

  // Calculate price range if variants exist
  let minPrice = product.price;
  let maxPrice = product.price;
  let hasVariants = false;

  if (variants && variants.length > 0) {
    const prices = variants.map(v => v.price);
    minPrice = Math.min(...prices, product.price);
    maxPrice = Math.max(...prices, product.price);
    hasVariants = true;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-[#faf9f6] via-white to-[#f7e7ce]/30" />
      <div className="absolute top-0 -left-20 w-96 h-96 bg-linear-to-br from-[#f5c8c8]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-linear-to-tl from-[#b76e79]/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-[#800020] transition-colors flex items-center gap-1">
            <span>Home</span>
          </Link>
          <ChevronRight size={14} />
          <Link href="/shop" className="hover:text-[#800020] transition-colors flex items-center gap-1">
            <span>Shop</span>
          </Link>
          <ChevronRight size={14} />
          <Link
            href={`/shop?category=${product.category_name?.toLowerCase()}`}
            className="hover:text-[#800020] transition-colors flex items-center gap-1"
          >
            <span>{product.category_name}</span>
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#800020] font-medium truncate max-w-50 sm:max-w-none">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images Section - Modern Gallery */}
          <div>
            {/* Thumbnail Gallery */}
            <div>
              <ProductImageGallery
                images={product.images || []}
                productName={product.name}
                featured={product.featured}
                stock={product.stock}
              />
            </div>
          </div>

          {/* Product Info Section */}
          <div>
            {/* Category Badge & Name */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-medium text-[#800020]">{product.category_name}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Product Code */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <span className="font-medium">Product Code:</span>
                <span className="ml-2 bg-[#f7e7ce]/50 px-3 py-1 rounded-full font-mono">HS-{product.id.toString().padStart(4, '0')}</span>
              </div>
            </div>

            {/* Rating & Price Section */}
            <div className="mb-8 p-6 bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">

              {/* Price Display */}
              <div className="mb-4">
                {hasVariants && minPrice !== maxPrice ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[26px] md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79]">
                        ₦{minPrice.toLocaleString()}
                      </span>
                      <span className="text-2xl text-gray-400">-</span>
                      <span className="text-[26px] md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79]">
                        ₦{maxPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Price varies by selected length and color
                    </p>
                  </div>
                ) : (
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79]">
                    ₦{product.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Quick Stock Status */}
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-linear-to-r from-green-500 to-emerald-600' : 'bg-linear-to-r from-red-500 to-rose-600'}`} />
                <span className={`font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {product.stock > 0
                    ? `Available • ${product.stock} units in stock`
                    : 'Currently out of stock'}
                </span>
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-medium">Low stock • Order soon!</span>
                </div>
              )}
            </div>

            {/* Product Form */}
            <ProductForm product={product} variants={variants} />

            {/* Product Specifications */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.hair_type && (
                <div className="bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <Award size={14} />
                    Hair Type
                  </h4>
                  <p className="font-semibold text-gray-900">{product.hair_type}</p>
                </div>
              )}

              {product.texture && (
                <div className="bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <Package size={14} />
                    Texture
                  </h4>
                  <p className="font-semibold text-gray-900">{product.texture}</p>
                </div>
              )}

              {product.length && product.length.length > 0 && (
                <div className="bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Available Lengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.length.map((len) => (
                      <span
                        key={len}
                        className="px-3 py-1.5 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] text-sm font-medium rounded-full border border-white/50"
                      >
                        {len}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.color && product.color.length > 0 && (
                <div className="bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Available Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.color.map((color, index) => (
                      <div
                        key={index}
                        className="relative group"
                        title={color}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: color.startsWith('#') ? color : '#f0f0f0' }}
                        />
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {color}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>Product Description</span>
                <div className="w-6 h-px bg-linear-to-r from-[#b76e79] to-[#800020] flex-1" />
              </h3>
              <div className="bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || 'Premium quality hair designed for exceptional performance and style. Crafted with attention to detail for a luxurious experience.'}
                </p>
              </div>
            </div>

            {/* Premium Features */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose This Hair?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <Check size={20} />, title: "100% Human Hair", desc: "Premium quality with minimal shedding" },
                  { icon: <Check size={20} />, title: "Can Be Styled", desc: "Can be colored, bleached, and heat styled" },
                  { icon: <Check size={20} />, title: "Double Drawn", desc: "Minimal thin ends, full and thick" },
                  { icon: <Check size={20} />, title: "Tangle-Free", desc: "Easy to maintain and style" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                    <div className="w-10 h-10 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-lg flex items-center justify-center shrink-0">
                      <div className="text-[#800020]">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Guarantee */}
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                  <div className="w-14 h-14 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck size={24} className="text-[#800020]" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Free Shipping</h4>
                  <p className="text-sm text-gray-600">On orders over ₦1,000,000</p>
                </div>

                <div className="text-center p-6 bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                  <div className="w-14 h-14 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-[#800020]" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                  <p className="text-sm text-gray-600">Available customer support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-12 lg:mt-16">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}