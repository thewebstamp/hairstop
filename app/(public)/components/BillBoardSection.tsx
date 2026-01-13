//(public)/components/BillBoardSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Heart, Flower2, Scissors, Globe, Clock } from 'lucide-react';
import Link from 'next/link';

const announcements = [
  {
    id: 1,
    title: 'Artisan Crafted',
    description: 'Each hair weaved meticulously upon order - a unique piece of wearable art',
    icon: <Scissors className="text-[#800020]" />,
    gradient: 'from-[#f7e7ce]/95 via-[#f5c8c8]/80 to-[#f7e7ce]/90',
    textColor: 'text-[#800020]',
    accentColor: '#b76e79',
    pattern: 'diamond',
    link: '/shop',
    feature: 'Made-to-Order'
  },
  {
    id: 2,
    title: 'Globally Curated',
    description: 'Imported premium hairs, foreign-processed for luxury quality standards and feel',
    icon: <Globe className="text-[#800020]" />,
    gradient: 'from-[#f7e7ce]/95 via-[#f5c8c8]/80 to-[#f7e7ce]/90',
    textColor: 'text-[#800020]',
    accentColor: '#b76e79',
    pattern: 'dots',
    link: '/shop',
    feature: 'International'
  },
  {
    id: 3,
    title: 'Worth the Wait',
    description: 'Patiently crafted perfection - each order receives undivided artisan attention',
    icon: <Clock className="text-[#800020]" />,
    gradient: 'from-[#f7e7ce]/95 via-[#f5c8c8]/80 to-[#f7e7ce]/90',
    textColor: 'text-[#800020]',
    accentColor: '#b76e79',
    pattern: 'floral',
    link: '/shop',
    feature: 'Patience Rewarded'
  }
];

export default function BillboardSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % announcements.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <section className="relative py-8 md:py-14 overflow-hidden">
      {/* Background with soft gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-white via-[#faf9f6] to-[#f7e7ce]/30" />

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-linear-to-br from-[#f5c8c8]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-linear-to-tl from-[#b76e79]/5 to-transparent rounded-full blur-3xl" />

      {/* Delicate pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #b76e79 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto max-w-350 px-4 md:px-6 relative z-10">
        {/* Section Header with Elegant Typography */}
        <div className="mb-5 md:mb-7 text-center">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#f7e7ce]/80 to-[#f5c8c8]/80 backdrop-blur-md px-6 py-2 rounded-full mb-4 border border-white/50 shadow-sm">
            <Sparkles size={18} className="text-[#b76e79]" />
            <span className="text-sm font-medium text-[#800020] tracking-wider">LUXURY HIGHLIGHTS</span>
          </div>
        </div>

        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Billboard Container */}
          <div className="relative overflow-hidden rounded-3xl md:rounded-4xl shadow-2xl shadow-[#b76e79]/5">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
              {/* Pattern background with repeated logo */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'url(/images/logo1.png)',
                  backgroundRepeat: 'repeat',
                  backgroundSize: '110px 110px',
                  backgroundPosition: 'center'
                }}
              />
            </div>

            {/* Animated Slides */}
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {announcements.map((item) => (
                <div key={item.id} className="w-full shrink-0">
                  <div className={`relative bg-linear-to-r ${item.gradient} p-8 md:p-12 lg:p-16 border border-white/40`}>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                      {item.pattern === 'floral' && (
                        <div className="absolute inset-0" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15a15 15 0 0 1 0 30 15 15 0 0 1 0-30zm0 5a10 10 0 0 0 0 20 10 10 0 0 0 0-20z' fill='%23b76e79' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                          backgroundSize: '30px 30px'
                        }} />
                      )}
                      {item.pattern === 'diamond' && (
                        <div className="absolute inset-0" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 10l10 10-10 10L10 20z' fill='%23b76e79' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                          backgroundSize: '20px 20px'
                        }} />
                      )}
                      {item.pattern === 'dots' && (
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 25% 25%, #b76e79 1px, transparent 1px)`,
                          backgroundSize: '40px 40px'
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 max-w-6xl mx-auto">
                      {/* Left Side with Icon and Text */}
                      <div className="flex items-center gap-6 md:gap-8">
                        {/* Icon Container with Glow */}
                        <div className="relative hidden md:block">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-white/90 to-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-black/5 border border-white/50">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-xl flex items-center justify-center">
                              {item.icon}
                            </div>
                          </div>
                          {/* Floating accent */}
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#800020] rounded-full flex items-center justify-center">
                            <Heart size={12} className="text-white" />
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 max-w-xl">
                          {/* Feature Tag */}
                          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 border border-white/40">
                            <span className="text-xs font-semibold text-[#800020] tracking-wider">
                              {item.feature}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-center md:text-left text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                            {item.title}
                          </h3>

                          {/* Description */}
                          <p className="text-center md:text-left text-lg text-gray-700 mb-6">
                            {item.description}
                          </p>

                          {/* CTA Button */}
                          <Link
                            href={item.link}
                            className="group w-fit mx-auto md:mx-0 flex items-center gap-3 px-8 py-3.5 bg-linear-to-r from-[#800020] to-[#b76e79] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#800020]/20 transition-all duration-300 transform hover:-translate-y-0.5"
                          >
                            <span>Discover More</span>
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Right Side Decorative Element */}
                      <div className="hidden lg:block relative">
                        <div className="w-48 h-48 relative">
                          {/* Floating circles */}
                          <div className="absolute top-0 right-0 w-32 h-32 border-2 border-[#f5c8c8]/30 rounded-full" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 border-2 border-[#f7e7ce]/30 rounded-full" />

                          {/* Central decorative element */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] rounded-full flex items-center justify-center">
                            <Flower2 size={28} className="text-[#800020]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons with Feminine Design */}
          <div className="hidden md:block">
            <button
              onClick={prevSlide}
              className="absolute md:p-2 lg:p-4 transition-all duration-300 -translate-y-1/2 rounded-full shadow-xl left-2 top-1/2 bg-white/90 backdrop-blur-md hover:bg-white hover:scale-110 group border border-white/30"
            >
              <div className="relative">
                <ChevronLeft size={24} className="text-[#800020] group-hover:text-[#b76e79]" />
                <div className="absolute -inset-2 bg-linear-to-r from-[#f5c8c8]/20 to-transparent rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            <button
              onClick={nextSlide}
              className="absolute md:p-2 lg:p-4 transition-all duration-300 -translate-y-1/2 rounded-full shadow-xl right-2 top-1/2 bg-white/90 backdrop-blur-md hover:bg-white hover:scale-110 group border border-white/30"
            >
              <div className="relative">
                <ChevronRight size={24} className="text-[#800020] group-hover:text-[#b76e79]" />
                <div className="absolute -inset-2 bg-linear-to-r from-transparent to-[#f5c8c8]/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>

          {/* Progress Dots - Feminine Design */}
          <div className="flex justify-center gap-4 mt-8 md:mt-10">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group relative"
              >
                <div className={`relative w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-linear-to-r from-[#b76e79] to-[#800020] scale-125'
                  : 'bg-gray-300 group-hover:bg-gray-400'
                  }`}>
                  {/* Glow effect for active dot */}
                  {index === currentSlide && (
                    <>
                      <div className="absolute -inset-2 bg-linear-to-r from-[#b76e79]/20 to-[#800020]/20 rounded-full blur-sm" />
                      <div className="absolute -inset-1 bg-linear-to-r from-[#f5c8c8] to-transparent rounded-full animate-ping" />
                    </>
                  )}
                </div>

                {/* Tooltip label on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium text-[#800020]">
                    {announcements[index].title}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="mt-12 flex items-center justify-center gap-6 text-[#800020]/50">
          <div className="w-20 h-px bg-linear-to-r from-transparent via-[#b76e79] to-transparent" />
          <Sparkles size={20} className="animate-pulse" />
          <div className="w-20 h-px bg-linear-to-r from-transparent via-[#b76e79] to-transparent" />
        </div>
      </div>
    </section>
  );
}