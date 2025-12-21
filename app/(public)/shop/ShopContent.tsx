// app/(public)/shop/ShopContent.tsx - CLIENT COMPONENT
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Category, Product } from '@/lib/data';
import { Filter, X, Star, Sparkles, Eye } from 'lucide-react';

interface ShopContentProps {
    initialData: {
        categories: Category[];
        products: Product[];
        total: number;
        page: number;
        totalPages: number;
    };
    searchParams: { category?: string; minPrice?: string; maxPrice?: string; page?: string };
}

export default function ShopContent({ initialData, searchParams }: ShopContentProps) {
    const router = useRouter();
    const [filters, setFilters] = useState({
        category: searchParams.category || '',
        minPrice: searchParams.minPrice || '',
        maxPrice: searchParams.maxPrice || '',
    });
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const { categories, products, total, page, totalPages } = initialData;

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);

        const params = new URLSearchParams();

        // Only add non-empty filters
        if (newFilters.category) params.set('category', newFilters.category);
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);

        // Navigate to the new URL
        router.push(`/shop?${params.toString()}`);
    };

    // And update the clearFilters function:
    const clearFilters = () => {
        setFilters({ category: '', minPrice: '', maxPrice: '' });
        router.push('/shop');
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        params.set('page', newPage.toString());

        router.push(`/shop?${params.toString()}`);
    };

    return (
        <>
            {/* Mobile Filter Button - Fixed at Bottom Right */}
            <div className="fixed bottom-6 left-4 z-40 lg:hidden">
                <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-[#800020] to-[#b76e79] text-white font-semibold rounded-full shadow-xl shadow-[#800020]/40 hover:shadow-2xl hover:shadow-[#800020]/50 transition-all duration-300"
                >
                    <Filter size={20} />
                    <span className="text-sm font-medium">Filters</span>
                    {(filters.category || filters.minPrice || filters.maxPrice) && (
                        <span className="w-6 h-6 bg-white text-[#800020] rounded-full text-xs font-bold flex items-center justify-center">
                            !
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Filter Overlay */}
            <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${mobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileFilterOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileFilterOpen(false)}
                />

                {/* Filter Panel */}
                <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${mobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                    <p className="text-sm text-gray-600 mt-1">Refine your search</p>
                                </div>
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Category Filter */}
                            <div className="mb-8">
                                <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                                    <span>Category</span>
                                    <div className="w-1.5 h-1.5 bg-[#b76e79] rounded-full" />
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleFilterChange('category', '')}
                                        className={`block w-full text-left px-4 py-3 rounded-xl border transition-all ${!filters.category ? 'bg-linear-to-r from-[#800020] to-[#b76e79] text-white border-transparent shadow-sm' : 'border-gray-200 hover:border-[#b76e79] hover:bg-[#f7e7ce]/20'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleFilterChange('category', cat.slug)}
                                            className={`block w-full text-left px-4 py-3 rounded-xl border transition-all ${filters.category === cat.slug ? 'bg-linear-to-r from-[#800020] to-[#b76e79] text-white border-transparent shadow-sm' : 'border-gray-200 hover:border-[#b76e79] hover:bg-[#f7e7ce]/20'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-8">
                                <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                                    <span>Price Range</span>
                                    <div className="w-1.5 h-1.5 bg-[#b76e79] rounded-full" />
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 mb-2 block font-medium">Min Price</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={filters.minPrice}
                                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                    className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:border-[#b76e79] focus:ring-2 focus:ring-[#b76e79]/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 mb-2 block font-medium">Max Price</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={filters.maxPrice}
                                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                    className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:border-[#b76e79] focus:ring-2 focus:ring-[#b76e79]/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(filters.category || filters.minPrice || filters.maxPrice) && (
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg mb-4 text-gray-900">Active Filters</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {filters.category && (
                                            <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                {categories.find(c => c.slug === filters.category)?.name}
                                                <button
                                                    onClick={() => handleFilterChange('category', '')}
                                                    className="ml-1 hover:text-[#b76e79] transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        {filters.minPrice && (
                                            <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                Min: ₦{parseFloat(filters.minPrice).toLocaleString()}
                                                <button
                                                    onClick={() => handleFilterChange('minPrice', '')}
                                                    className="ml-1 hover:text-[#b76e79] transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        {filters.maxPrice && (
                                            <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                Max: ₦{parseFloat(filters.maxPrice).toLocaleString()}
                                                <button
                                                    onClick={() => handleFilterChange('maxPrice', '')}
                                                    className="ml-1 hover:text-[#b76e79] transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <div className="space-y-3">
                                <button
                                    onClick={clearFilters}
                                    className="w-full py-3 border-2 border-[#800020] text-[#800020] font-semibold rounded-xl hover:bg-[#800020]/5 transition-all"
                                >
                                    Clear All Filters
                                </button>
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Fixed Width Issues */}
            <div className="relative min-h-screen w-full overflow-x-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 25px 25px, #b76e79 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                {/* Gradient Orbs */}
                <div className="absolute top-0 -left-20 w-96 h-96 bg-linear-to-br from-[#f5c8c8]/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 -right-20 w-96 h-96 bg-linear-to-tl from-[#b76e79]/5 to-transparent rounded-full blur-3xl" />

                <div className="container mx-auto max-w-350 px-4 md:px-6 py-8 md:py-12 relative z-10">
                    {/* Header Section - Centered on Mobile */}
                    <div className="mb-8 md:mb-12 text-center">
                        <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] px-4 py-1.5 rounded-full mb-4">
                            <Sparkles size={14} className="text-[#b76e79]" />
                            <span className="text-xs font-medium text-[#800020] tracking-wider">EXQUISITE COLLECTION</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                            Discover{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b76e79] to-[#800020]">
                                Luxury Hair
                            </span>
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
                            Premium quality hair for every style and occasion
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Desktop Filters Sidebar */}
                        <div className="hidden lg:block lg:w-1/4">
                            <div className="sticky top-28 space-y-8">
                                <div className="bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                        {(filters.category || filters.minPrice || filters.maxPrice) && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm font-medium text-[#b76e79] hover:text-[#800020] transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {/* Category Filter */}
                                    <div className="mb-8">
                                        <h3 className="font-bold text-lg mb-4 text-gray-900">Category</h3>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleFilterChange('category', '')}
                                                className={`block w-full text-left px-4 py-3 rounded-xl border transition-all ${!filters.category ? 'bg-linear-to-r from-[#800020] to-[#b76e79] text-white border-transparent' : 'border-gray-200 hover:border-[#b76e79] hover:bg-[#f7e7ce]/20'}`}
                                            >
                                                All Categories
                                            </button>
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleFilterChange('category', cat.slug)}
                                                    className={`block w-full text-left px-4 py-3 rounded-xl border transition-all ${filters.category === cat.slug ? 'bg-linear-to-r from-[#800020] to-[#b76e79] text-white border-transparent' : 'border-gray-200 hover:border-[#b76e79] hover:bg-[#f7e7ce]/20'}`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Filter */}
                                    <div className="mb-8">
                                        <h3 className="font-bold text-lg mb-4 text-gray-900">Price Range</h3>
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Min"
                                                            value={filters.minPrice}
                                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                            className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:border-[#b76e79] focus:ring-2 focus:ring-[#b76e79]/20 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Max"
                                                            value={filters.maxPrice}
                                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                            className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:border-[#b76e79] focus:ring-2 focus:ring-[#b76e79]/20 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Filters */}
                                    {(filters.category || filters.minPrice || filters.maxPrice) && (
                                        <div className="pt-6 border-t border-gray-200">
                                            <h3 className="font-bold text-lg mb-4 text-gray-900">Active Filters</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {filters.category && (
                                                    <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                        {categories.find(c => c.slug === filters.category)?.name}
                                                        <button
                                                            onClick={() => handleFilterChange('category', '')}
                                                            className="ml-1 hover:text-[#b76e79] transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.minPrice && (
                                                    <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                        Min: ₦{parseFloat(filters.minPrice).toLocaleString()}
                                                        <button
                                                            onClick={() => handleFilterChange('minPrice', '')}
                                                            className="ml-1 hover:text-[#b76e79] transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.maxPrice && (
                                                    <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                        Max: ₦{parseFloat(filters.maxPrice).toLocaleString()}
                                                        <button
                                                            onClick={() => handleFilterChange('maxPrice', '')}
                                                            className="ml-1 hover:text-[#b76e79] transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Products Grid - Centered on Mobile */}
                        <div className="lg:w-3/4">
                            {/* Results Info */}
                            <div className="mb-6 md:mb-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <p className="text-gray-700 text-center md:text-left">
                                        Showing <span className="font-bold text-[#800020]">{products.length}</span> of{' '}
                                        <span className="font-bold text-gray-900">{total}</span> products
                                    </p>

                                    {/* Active Filters for Desktop */}
                                    <div className="hidden md:flex flex-wrap gap-2">
                                        {filters.category && (
                                            <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                {categories.find(c => c.slug === filters.category)?.name}
                                                <button
                                                    onClick={() => handleFilterChange('category', '')}
                                                    className="ml-1 hover:text-[#b76e79] transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        {filters.minPrice && (
                                            <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                Min: ₦{parseFloat(filters.minPrice).toLocaleString()}
                                                <button
                                                    onClick={() => handleFilterChange('minPrice', '')}
                                                    className="ml-1 hover:text-[#b76e79] transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        {filters.maxPrice && (
                                            <span className="inline-flex items-center gap-1 bg-linear-to-r from-[#f7e7ce] to-[#f5c8c8] text-[#800020] px-3 py-1.5 rounded-full text-sm font-medium">
                                                Max: ₦{parseFloat(filters.maxPrice).toLocaleString()}
                                                <button
                                                    onClick={() => handleFilterChange('maxPrice', '')}
                                                    className="ml-1 hover:text-[#b76e79] transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Empty State */}
                                {products.length === 0 ? (
                                    <div className="text-center py-16 md:py-24 bg-linear-to-br from-white to-[#faf9f6]/80 rounded-2xl border border-gray-100/50 shadow-sm">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-full flex items-center justify-center">
                                            <span className="text-4xl">💇‍♀️</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                            Try adjusting your filters or browse all products
                                        </p>
                                        <button
                                            onClick={clearFilters}
                                            className="group inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-[#800020] to-[#b76e79] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#800020]/20 transition-all duration-300"
                                        >
                                            <span>Clear Filters</span>
                                            <X size={18} className="group-hover:rotate-90 transition-transform" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Products Grid - Centered on Mobile */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
                                            {products.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/shop/${encodeURIComponent(product.slug)}`}
                                                    className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-white to-[#faf9f6]/80 border border-gray-100/50 shadow-lg hover:shadow-2xl hover:shadow-[#800020]/5 transition-all duration-500 transform hover:-translate-y-2 w-full max-w-sm"
                                                >
                                                    {/* Product Image */}
                                                    <div className="relative aspect-square overflow-hidden rounded-t-2xl md:rounded-t-3xl">
                                                        {product.images && product.images[0] ? (
                                                            <>
                                                                <Image
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                                                                <div className="bg-linear-to-r from-[#800020] to-[#b76e79] text-white px-2 py-1 rounded text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/30">
                                                                    <div className="flex items-center gap-1">
                                                                        <Star size={10} className="fill-white" />
                                                                        <span>Featured</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Hover Overlay with View Details */}
                                                        <div className="absolute inset-0 bg-linear-to-t from-[#800020]/90 via-[#b76e79]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                            <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg mb-3">
                                                                    <Eye size={14} className="text-[#800020]" />
                                                                    <span className="text-[#800020] font-semibold text-sm">View Details</span>
                                                                </div>
                                                                <p className="text-white text-sm font-medium">Tap to explore</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="relative p-5 md:p-6">
                                                        <div className="mb-2">
                                                            <span className="text-sm text-gray-500 text-center lg:text-left block">
                                                                {product.category_name}
                                                            </span>
                                                            <h3 className="font-semibold text-lg md:text-xl group-hover:text-[#800020] transition-colors text-center lg:text-left">
                                                                {product.name}
                                                            </h3>
                                                        </div>
                                                        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] mb-4 line-clamp-2 text-center lg:text-left">
                                                            {product.description}
                                                        </p>
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                                            <div className="flex flex-col items-center lg:items-start">
                                                                <span className="text-xl font-bold text-[#800020]">
                                                                    ₦{product.price.toLocaleString()}
                                                                </span>
                                                                <span className="text-xs text-gray-500 mt-1">Starting price</span>
                                                            </div>
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
                                                        </div>
                                                    </div>

                                                    {/* Gradient Accent Border */}
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-[#b76e79] via-[#800020] to-[#b76e79] rounded-b-2xl md:rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-12 md:mt-16">
                                                <nav className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <p className="text-gray-600 text-sm text-center md:text-left">
                                                        Page {page} of {totalPages}
                                                    </p>
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <button
                                                            onClick={() => handlePageChange(page - 1)}
                                                            disabled={page === 1}
                                                            className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                                                        >
                                                            Previous
                                                        </button>
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => handlePageChange(pageNum)}
                                                                className={`px-3 py-2 border rounded-md transition-all ${page === pageNum ? 'bg-linear-to-r from-[#800020] to-[#b76e79] text-white border-transparent' : 'hover:bg-gray-50'}`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => handlePageChange(page + 1)}
                                                            disabled={page === totalPages}
                                                            className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </nav>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}