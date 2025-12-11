'use client';

import { ArrowRight, Sparkles, Shield, Truck, CheckCircle, Award, Heart } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#faf9f6] via-white to-[#f7e7ce]">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, #b76e79 0.5px, transparent 0.5px),
                           linear-gradient(to bottom, #b76e79 0.5px, transparent 0.5px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Curved Shape Elements */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-[#f5c8c8]/10 to-transparent rounded-full blur-xl" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-tl from-[#b76e79]/5 to-transparent rounded-full blur-xl" />

      <div className="container mx-auto max-w-[1400px] px-6 py-9 pb-[84px] md:py-[55px] md:pb-[90px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#f7e7ce] to-[#f5c8c8] px-4 py-2 rounded-full mb-6 shadow-sm lg:justify-start">
              <Sparkles size={16} className="text-[#b76e79]" />
              <span className="text-sm font-medium text-[#800020]">Premium Quality Guarantee</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your First Stop for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b76e79] to-[#800020] mt-2">
                Quality & Luxury Hair
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 md:mb-10 leading-relaxed mx-auto lg:mx-0 max-w-lg text-center lg:text-left">
              Elevate your style with hair that combines unmatched quality with luxurious sophistication.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 md:mb-12 justify-center lg:justify-start">
              <Link 
                href="/shop"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#800020] to-[#b76e79] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#b76e79]/20 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Shop Now</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#b76e79] to-[#800020] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <Link 
                href="/#categories"
                onClick={handleCategoriesClick}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-[#800020]/20 text-[#800020] font-semibold rounded-full hover:border-[#800020] hover:bg-[#800020]/5 transition-all duration-300"
              >
                <span>See Categories</span>
                <div className="w-6 h-6 rounded-full border border-[#800020]/30 group-hover:border-[#800020] flex items-center justify-center">
                  <ArrowRight size={12} />
                </div>
              </Link>
            </div>

            {/* Feature Points */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 pt-8 border-t border-gray-200/30">
              <div className="flex flex-col items-center text-center p-2 md:p-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-full flex items-center justify-center mb-2 md:mb-3 shadow-sm">
                  <Award size={18} className="text-[#800020] md:size-20" />
                </div>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">Premium Quality</p>
                <p className="text-[10px] md:text-xs text-gray-500">Verified & Tested</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-2 md:p-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#f5c8c8] to-[#faf9f6] rounded-full flex items-center justify-center mb-2 md:mb-3 shadow-sm">
                  <Truck size={18} className="text-[#800020] md:size-20" />
                </div>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">Fast Shipping</p>
                <p className="text-[10px] md:text-xs text-gray-500">Worldwide</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-2 md:p-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#faf9f6] to-[#f7e7ce] rounded-full flex items-center justify-center mb-2 md:mb-3 shadow-sm">
                  <Heart size={18} className="text-[#b76e79] md:size-20" />
                </div>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">Luxury Experience</p>
                <p className="text-[10px] md:text-xs text-gray-500">5★ Rated</p>
              </div>
            </div>
          </div>
          
          {/* Hero Image  */}
          <div className="relative">
            <div className="relative max-w-md lg:max-w-lg mx-auto">
              {/* Image Container */}
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl group">
                <div className="aspect-square md:aspect-[3/4] lg:aspect-[4/5] relative overflow-hidden">
                  <Image
                    src="/images/hairstop.jpg"
                    alt="Premium luxury hair bundles and wigs collection at Hair Stop"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                  {/* overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
              </div>

              {/* Border Effect */}
              <div className="absolute -inset-4 -z-10 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#b76e79]/10 to-[#800020]/5 rounded-3xl blur-md" />
              </div>

              {/* Decorative Elements - Desktop Only */}
              <div className="hidden lg:block">
                <div className="absolute -top-4 -right-4 w-24 h-24 border border-[#b76e79]/20 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-[#800020]/10 rounded-full" />
              </div>
            </div>

            {/* Floating Stats - Desktop Only */}
            <div className="hidden lg:block">
              <div className="absolute -left-6 top-1/3 bg-white p-4 rounded-xl shadow-lg transform -rotate-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#800020] flex items-center gap-1">
                    <Award size={20} />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Premium</div>
                </div>
              </div>
              
              <div className="absolute -right-6 bottom-1/3 bg-white p-4 rounded-xl shadow-lg transform rotate-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#800020]">5★</div>
                  <div className="text-xs text-gray-600">Rated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Mobile Only */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 lg:hidden">
        <a 
          href="#categories" 
          onClick={handleCategoriesClick}
          className="inline-flex flex-col items-center text-[#b76e79] hover:text-[#800020] transition-colors group"
        >
          <span className="text-xs font-medium mb-1">Explore</span>
          <div className="w-5 h-8 border border-[#b76e79] rounded-full flex justify-center group-hover:border-[#800020]">
            <div className="w-0.5 h-2 bg-[#b76e79] rounded-full mt-2 animate-bounce group-hover:bg-[#800020]" />
          </div>
        </a>
      </div>
    </section>
  );
}