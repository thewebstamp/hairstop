// app/(public)/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getCategories, getFeaturedProducts } from "@/lib/data";
import HeroSection from "./components/HeroSection";
import BillboardSection from "./components/BillBoardSection";
import { ArrowRight, ChevronRight, Crown, Gem, Heart, Sparkles, Star } from "lucide-react";

export default async function HomePage() {
    const [categories, featuredProducts] = await Promise.all([
        getCategories(),
        getFeaturedProducts(8),
    ]);

    return (
        <div className="min-h-screen">
            <HeroSection />
            <BillboardSection />

            {/* Featured Products */}
            <section className="relative py-20 md:py-28 overflow-hidden">
                {/* Sleek Background with Hair-Inspired Pattern */}
                <div className="absolute inset-0 bg-linear-to-br from-[#faf9f6] via-white to-[#f7e7ce]/30" />

                {/* Hair Strands Geometric Pattern */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                linear-linear-gradient(45deg, transparent 65%, #b76e79 65%, #b76e79 67%, transparent 67%),
                linear-linear-gradient(-45deg, transparent 65%, #800020 65%, #800020 67%, transparent 67%),
                linear-linear-gradient(90deg, transparent 90%, #f5c8c8 90%, #f5c8c8 92%, transparent 92%)
            `,
                        backgroundSize: '120px 120px, 120px 120px, 60px 60px'
                    }} />
                </div>

                {/* Animated Hair Strands */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Strand 1 - Left */}
                    <div className="absolute top-10 left-5 w-1 h-40 bg-linear-to-b from-transparent via-[#b76e79]/10 to-transparent transform rotate-45" />
                    <div className="absolute top-20 left-10 w-0.5 h-32 bg-linear-to-b from-transparent via-[#800020]/10 to-transparent transform -rotate-12" />

                    {/* Strand 2 - Right */}
                    <div className="absolute bottom-10 right-5 w-1.5 h-36 bg-linear-to-b from-transparent via-[#f5c8c8]/10 to-transparent transform rotate-12" />
                </div>

                {/* Gradient Orbs */}
                <div className="absolute top-10 -left-20 w-80 h-80 bg-linear-to-br from-[#f5c8c8]/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-10 -right-20 w-80 h-80 bg-linear-to-tl from-[#800020]/5 to-transparent rounded-full blur-3xl" />

                <div className="container mx-auto max-w-350 px-4 md:px-6 relative z-10">
                    {/* Modern Section Header - Centered for Mobile */}
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#f7e7ce]/90 to-[#f5c8c8]/90 backdrop-blur-sm px-5 py-2 rounded-full mb-4 border border-white/50 shadow-sm">
                            <Sparkles size={16} className="text-[#b76e79]" />
                            <span className="text-sm font-medium text-[#800020] tracking-wider">PREMIUM SELECTION</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Featured Luxury{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b76e79] via-[#800020] to-[#b76e79]">
                                Hair Products
                            </span>
                        </h2>
                        <p className="text-gray-600 max-w-xl mx-auto text-base md:text-lg">
                            Premium selections for exceptional quality and style
                        </p>
                    </div>

                    {/* Modern Product Grid - Centered for Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 place-items-center md:place-items-start">
                        {featuredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/shop/${product.slug}`}
                                className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-white to-[#faf9f6]/80 border border-gray-100/50 shadow-lg hover:shadow-2xl hover:shadow-[#800020]/5 transition-all duration-500 transform hover:-translate-y-2 max-w-xs md:max-w-none w-full"
                            >
                                {/* Product Image Container */}
                                <div className="relative aspect-square overflow-hidden rounded-t-2xl md:rounded-t-3xl">
                                    {product.images && product.images[0] ? (
                                        <>
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8]">
                                            <div className="relative">
                                                <div className="text-5xl opacity-30">💇‍♀️</div>
                                                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent blur-sm" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Featured Badge */}
                                    {product.featured && (
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-linear-to-r from-[#800020] to-[#b76e79] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/30">
                                                <div className="flex items-center gap-1">
                                                    <Star size={10} className="fill-white" />
                                                    <span>Featured</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-[#800020]/90 via-[#b76e79]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg">
                                                <span className="text-[#800020] font-semibold text-sm">View Details</span>
                                                <ArrowRight size={14} className="text-[#800020]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="relative p-5 md:p-6">
                                    {/* Product Name */}
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#800020] transition-colors duration-300 mb-2 line-clamp-1 text-center md:text-left">
                                        {product.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-[15.5px] md:text-[16.5px] mb-4 line-clamp-2 min-h-10 text-center md:text-left">
                                        {product.description}
                                    </p>

                                    {/* Price & Length */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                        <div className="flex flex-col items-center md:items-start">
                                            <span className="text-xl font-bold text-[#800020]">
                                                ₦{product.price.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">Starting price</span>
                                        </div>

                                        {product.length && product.length.length > 0 && (
                                            <div className="flex flex-col items-center md:items-end">
                                                <div className="flex items-center gap-1 flex-wrap justify-center">
                                                    {product.length.slice(0, 2).map((len) => (
                                                        <span
                                                            key={len}
                                                            className="text-xs bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] px-2.5 py-1 rounded-full font-medium text-[#800020] border border-white/50"
                                                        >
                                                            {len}
                                                        </span>
                                                    ))}
                                                    {product.length.length > 2 && (
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            +{product.length.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1">Available lengths</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gradient Accent Border */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-[#b76e79] via-[#800020] to-[#b76e79] rounded-b-2xl md:rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                        ))}
                    </div>

                    {/* View All Products Button - Centered at Bottom */}
                    <div className="text-center mt-12 md:mt-16">
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-[#800020] to-[#b76e79] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#800020]/20 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <span className="text-base md:text-lg">View All Products</span>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section id="categories" className="relative py-20 md:py-28 overflow-hidden">
                {/* Main Background with Hair Strands Pattern */}
                <div className="absolute inset-0 bg-linear-to-b from-white via-[#faf9f6] to-[#f7e7ce]/30" />

                {/* Hair Strands Pattern Background - Subtle Texture */}
                <div className="absolute inset-0 opacity-[0.03] bg-repeat" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60,10 C70,30 80,40 90,50 C80,60 70,70 60,90 C50,70 40,60 30,50 C40,40 50,30 60,10 Z' fill='none' stroke='%23b76e79' stroke-width='0.5'/%3E%3Cpath d='M20,40 C30,50 40,60 50,70 C40,80 30,90 20,100 C10,90 0,80 0,70 C10,60 20,50 20,40 Z' fill='none' stroke='%23800020' stroke-width='0.3'/%3E%3Cpath d='M100,60 C110,70 100,80 90,90 C80,100 70,110 60,120 C50,110 40,100 30,90 C20,80 10,70 20,60 C30,50 40,40 50,30 C60,20 70,10 80,20 C90,30 100,40 100,50 Z' fill='none' stroke='%23f5c8c8' stroke-width='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }} />

                {/* Animated Hair Strands - Floating Effect */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Strand 1 */}
                    <div className="absolute top-1/4 left-5 w-2 h-40 bg-linear-to-b from-transparent via-[#b76e79]/10 to-transparent transform rotate-45 animate-float-slow" />
                    <div className="absolute top-1/3 left-10 w-1 h-32 bg-linear-to-b from-transparent via-[#800020]/10 to-transparent transform -rotate-12 animate-float-slower delay-300" />

                    {/* Strand 2 */}
                    <div className="absolute top-2/3 right-5 w-1.5 h-48 bg-linear-to-b from-transparent via-[#f5c8c8]/10 to-transparent transform rotate-12 animate-float-slow delay-500" />
                    <div className="absolute top-1/2 right-15 w-1 h-36 bg-linear-to-b from-transparent via-[#b76e79]/10 to-transparent transform -rotate-25 animate-float-slower delay-700" />

                    {/* Strand 3 */}
                    <div className="absolute bottom-1/4 left-1/4 w-2 h-44 bg-linear-to-b from-transparent via-[#800020]/10 to-transparent transform rotate-30 animate-float-slow delay-1000" />

                    {/* Strand 4 */}
                    <div className="absolute top-1/5 right-1/4 w-1 h-40 bg-linear-to-b from-transparent via-[#f5c8c8]/10 to-transparent transform -rotate-20 animate-float-slower delay-1200" />
                </div>

                {/* Gradient Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#f5c8c8]/15 via-[#f7e7ce]/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#b76e79]/10 via-[#800020]/5 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.01]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(to right, #b76e79 0.5px, transparent 0.5px),
                             linear-gradient(to bottom, #b76e79 0.5px, transparent 0.5px)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="container mx-auto max-w-350 px-4 md:px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-12 md:mb-20">
                        <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#f7e7ce]/90 via-[#faf9f6]/80 to-[#f5c8c8]/90 backdrop-blur-sm px-6 py-2.5 rounded-full mb-6 border border-white/60 shadow-sm shadow-[#800020]/5">
                            <Sparkles size={18} className="text-[#b76e79]" />
                            <span className="text-sm font-medium text-[#800020] tracking-wider">EXQUISITE COLLECTIONS</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                            Shop According to{' '}
                            <span className="relative inline-block">
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b76e79] via-[#800020] to-[#b76e79]">
                                    Hair Categories
                                </span>
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-[#b76e79] via-[#800020] to-[#b76e79] rounded-full blur-xs" />
                            </span>
                        </h2>

                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            Categories of luxury hair for every style and occasion
                        </p>
                    </div>

                    {/* Mobile-optimized Category Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                        {categories.map((category, index) => (
                            <Link
                                key={category.id}
                                href={{
                                    pathname: '/shop',
                                    query: { category: category.slug }
                                }}
                                className="group relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-[#800020]/10 transition-all duration-500 transform hover:-translate-y-1 active:scale-95 md:hover:-translate-y-2"
                            >
                                {/* Mobile-optimized Card Container */}
                                <div className="relative h-full bg-linear-to-br from-white to-[#faf9f6]/80 border border-gray-100/50 rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden">
                                    {/* Image Container - Mobile Optimized */}
                                    <div className="relative aspect-4/3 md:aspect-3/4 lg:aspect-4/3 overflow-hidden">
                                        {category.image_url && (
                                            <Image
                                                src={category.image_url}
                                                alt={category.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                priority={index < 2}
                                            />
                                        )}

                                        {/* Double Gradient Overlay for Mobile Readability */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent md:bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                                        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/20" />

                                        {/* Mobile Floating Badge */}
                                        <div className="absolute top-3 right-3 md:top-4 md:right-4">
                                            <div className="px-3 py-1 bg-linear-to-r from-[#800020]/90 to-[#b76e79]/90 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm border border-white/30">
                                                {category.slug}
                                            </div>
                                        </div>

                                        {/* Mobile Touch-friendly Overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-[#800020]/90 via-[#b76e79]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <div className="text-center px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                {/* Mobile Touch-friendly Button */}
                                                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full mb-3 shadow-lg active:scale-95 transition-transform">
                                                    <span className="text-[#800020] font-semibold text-sm">Shop Now</span>
                                                    <ArrowRight size={14} className="text-[#800020]" />
                                                </div>
                                                <p className="text-white text-sm font-medium px-4">Tap to explore</p>
                                            </div>
                                        </div>

                                        {/* Mobile Category Name Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-linear-to-t from-black/80 via-black/50 to-transparent">
                                            <h3 className="text-white text-lg md:text-xl font-bold">
                                                {category.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Content Area - Mobile Optimized */}
                                    <div className="relative p-4 md:p-6 lg:p-8">
                                        {/* Mobile Category Icon & Name */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                                                {index === 0 && <Crown size={18} className="md:size-6 text-[#800020]" />}
                                                {index === 1 && <Star size={18} className="md:size-6 text-[#800020]" />}
                                                {index === 2 && <Gem size={18} className="md:size-6 text-[#800020]" />}
                                                {index === 3 && <Sparkles size={18} className="md:size-6 text-[#800020]" />}
                                                {index > 3 && <Heart size={18} className="md:size-6 text-[#800020]" />}
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#800020] transition-colors duration-300">
                                                {category.name}
                                            </h3>
                                        </div>

                                        {/* Description - Mobile Responsive */}
                                        <p className="text-gray-600 mb-4 text-[15.5px] md:text-[17px] line-clamp-2">
                                            {category.description}
                                        </p>

                                        {/* Mobile-friendly CTA */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className="text-[#800020] font-semibold text-[16.5px] tracking-wide">
                                                View Products
                                            </span>
                                            <div className="w-8 h-8 rounded-full border border-[#800020]/20 group-hover:border-[#800020] group-hover:bg-[#800020]/10 flex items-center justify-center transition-all duration-300 active:scale-90">
                                                <ChevronRight size={14} className="text-[#800020] group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Gradient Accent - Mobile */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-[#b76e79] via-[#800020] to-[#b76e79] rounded-b-xl md:rounded-b-2xl lg:rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Glow Effect - Mobile Optimized */}
                                <div className="absolute -inset-1 bg-linear-to-r from-[#b76e79]/10 via-[#800020]/10 to-[#b76e79]/10 rounded-xl md:rounded-2xl lg:rounded-3xl blur-sm md:blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                            </Link>
                        ))}
                    </div>

                    {/* View All Button - Mobile Optimized */}
                    <div className="text-center mt-10 md:mt-16">
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-linear-to-r from-[#800020] to-[#b76e79] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#800020]/20 transition-all duration-300 active:scale-95"
                        >
                            <span className="text-sm md:text-base">View All Categories</span>
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <ArrowRight size={14} className="md:size-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Call to Action - Modern Design  */}
            <section className="relative py-7 md:py-10 overflow-hidden">
                {/* Elegant Gradient Background */}
                <div className="absolute inset-0 bg-linear-to-br from-[#800020] via-[#b76e79] to-[#800020]" />

                {/* Hair Strand Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 opacity-100 bg-[url('/images/logo1.png')] bg-cover bg-center" />
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 left-10 w-64 h-64 bg-linear-to-br from-white/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-linear-to-tl from-white/5 to-transparent rounded-full blur-3xl" />

                <div className="container mx-auto max-w-5xl px-4 md:px-6 relative z-10">
                    <div className="text-center">
                        {/* Icon Badge */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/30">
                            <Sparkles size={24} className="text-white" />
                        </div>

                        {/* Headline */}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                            Discover Your Perfect {' '}
                            <span className="relative inline-block">
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#f7e7ce] via-[#faf9f6] to-[#f5c8c8]">
                                    Hair Trophy
                                </span>
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-[#f7e7ce] via-[#faf9f6] to-[#f5c8c8] rounded-full blur-xs" />
                            </span>
                        </h2>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                            <Link
                                href="/shop"
                                className="text-lg group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#800020] font-semibold rounded-full hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <span>Browse Collection</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-linear-to-r from-[#f7e7ce]/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}