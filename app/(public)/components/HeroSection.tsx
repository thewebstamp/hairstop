//components/home/HeroSection.tsx
'use client';

import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function HeroSection() {
  const pathname = usePathname();

  const handleCategoriesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      const categoriesSection = document.getElementById('categories');
      if (categoriesSection) {
        categoriesSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-10">
        {/* Full Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hairstop.jpg"
            alt="Premium luxury hair bundles and wigs collection at Hair Stop"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Enhanced Gradient Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-br from-[#800020]/30 via-transparent to-[#b76e79]/10" />
        </div>

        {/* Animated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-linear-to-br from-[#b76e79]/5 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-linear-to-tl from-[#800020]/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-linear-to-r from-[#f7e7ce]/10 to-transparent rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-350 px-6 relative z-10 py-20 md:py-32">
          {/* Change: Added text-center for mobile, lg:text-left for desktop */}
          <div className="max-w-2xl mx-auto text-center lg:text-left lg:mx-0">
            {/* Premium Badge with Animation */}
            <div className="group relative inline-flex items-center gap-4 bg-linear-to-r from-[#f7e7ce]/95 via-[#faf9f6] to-[#f5c8c8]/95 backdrop-blur-xl px-2 py-1 rounded-full mb-3 border-2 border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-fade-in-up hover:scale-[1.02] hover:-translate-y-1">
              {/* Left gradient accent */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-3/4 bg-linear-to-b from-[#b76e79] to-[#800020] rounded-full" />

              {/* Animated sparkle */}
              <div className="relative">
                <div className="w-10 h-10 bg-linear-to-br from-[#800020] to-[#b76e79] rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                  <Sparkles size={18} className="text-[#f7e7ce] animate-pulse-slow" />
                </div>
                {/* Outer glow */}
                <div className="absolute -inset-2 bg-linear-to-br from-[#b76e79]/20 to-[#800020]/20 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* HairStop text with gradient */}
              <div className="flex flex-col items-start">
                <span className="text-lg font-black leading-6 text-transparent bg-clip-text bg-linear-to-r from-[#800020] via-[#b76e79] to-[#800020]">
                  HairStop
                </span>
                <span className="text-xs font-medium text-gray-600 tracking-wide">
                  Premium Hair Destination
                </span>
              </div>

              {/* Right decorative element */}
              <div className="relative ml-4">
                <ShieldCheck size={20} className="text-[#800020] group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-[#800020]/5 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Hover effect background */}
              <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Border glow on hover */}
              <div className="absolute -inset-1 bg-linear-to-r from-[#b76e79]/20 via-[#800020]/20 to-[#b76e79]/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your First Stop for{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#f5c8c8] via-[#f7e7ce] to-[#faf9f6]">
                Quality & Luxury Hair
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-[#b76e79] to-[#800020] rounded-full" />
            </h1>

            {/* Description */}
            <p className="text-[18px] md:text-[21px] mx-auto lg:mx-0 text-white/90 mb-10 max-w-xl leading-relaxed">
              Where luxury meets quality in every strand of hair.
            </p>

            {/* CTA Buttons */}
            {/* Change: Added justify-center for mobile, lg:justify-start for desktop */}
            <div className="flex flex-col sm:flex-row gap-6 mb-16 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-linear-to-r from-[#800020] to-[#b76e79] text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-[#800020]/40 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#b76e79] to-[#800020] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 text-lg">Shop Now</span>
                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-linear-to-r from-[#f7e7ce]/20 to-transparent rounded-2xl blur group-hover:blur-md transition-all duration-300" />
              </Link>

              <Link
                href="/#categories"
                onClick={handleCategoriesClick}
                className="group inline-flex items-center justify-center gap-4 px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="text-lg">See Categories</span>
                <div className="w-8 h-8 rounded-full border border-white/40 group-hover:border-white/60 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <a
            href="#features"
            onClick={handleCategoriesClick}
            className="inline-flex flex-col items-center text-white hover:text-[#f5c8c8] transition-colors group"
          >
            <span className="text-sm font-medium mb-2 tracking-wider">EXPLORE</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center group-hover:border-[#f5c8c8]">
              <div className="w-1 h-3 bg-white rounded-full mt-2 group-hover:bg-[#f5c8c8]" />
            </div>
          </a>
        </div>
      </section>
    </>
  );
}