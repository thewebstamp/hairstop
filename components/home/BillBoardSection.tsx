'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag, Sparkles, Truck, Crown } from 'lucide-react';
import Link from 'next/link';

const announcements = [
  {
    id: 1,
    title: 'New Premium Collection',
    description: 'Experience our exclusive luxury hair textures',
    icon: <Crown className="text-[#800020]" />,
    gradient: 'from-[#f7e7ce] via-[#faf9f6] to-[#f5c8c8]',
    textColor: 'text-[#800020]',
    borderColor: 'border-[#f7e7ce]',
    link: '/shop'
  },
  {
    id: 2,
    title: 'Flash Sale',
    description: 'Get some % off on selected premium hairs',
    icon: <Tag className="text-[#800020]" />,
    gradient: 'from-[#b76e79] via-[#800020] to-[#b76e79]',
    textColor: 'text-white',
    borderColor: 'border-[#800020]/30',
    link: '/shop'
  },
  {
    id: 3,
    title: 'Free Luxury Shipping',
    description: 'On all orders over ₦1,000,000',
    icon: <Truck className="text-[#800020]" />,
    gradient: 'from-[#faf9f6] via-white to-[#f7e7ce]',
    textColor: 'text-[#800020]',
    borderColor: 'border-[#f5c8c8]',
    link: '/shop'
  },
  {
    id: 4,
    title: 'Premium Quality',
    description: '100% authentic human hair guaranteed',
    icon: <Sparkles className="text-[#800020]" />,
    gradient: 'from-[#f5c8c8] via-[#faf9f6] to-[#f7e7ce]',
    textColor: 'text-[#800020]',
    borderColor: 'border-[#b76e79]/20',
    link: '/shop'
  }
];

export default function BillboardSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 4000);
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
    <section className="relative py-8 overflow-hidden md:py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #b76e79 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto max-w-[1500px] px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-8 text-center md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f7e7ce] to-[#f5c8c8] px-4 py-2 rounded-full mb-3">
            <Sparkles size={16} className="text-[#b76e79]" />
            <span className="text-sm font-medium text-[#800020]">Special Offers</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Exclusive Promotions & <span className="text-[#800020]">Benefits</span>
          </h2>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden shadow-lg rounded-2xl md:rounded-3xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {announcements.map((item) => (
                <div key={item.id} className="w-full shrink-0">
                  <div className={`bg-gradient-to-r ${item.gradient} p-6 md:p-8 lg:p-10 border ${item.borderColor}`}>
                    <div className="flex flex-col items-center justify-between max-w-5xl gap-6 mx-auto lg:flex-row md:gap-8">
                      {/* Left Content */}
                      <div className="flex items-center flex-1 gap-4 md:gap-6">
                        <div className="p-3 shadow-sm md:p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                          <div className={item.id === 2 ? 'text-white' : 'text-[#800020]'}>
                            {item.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold ${item.textColor}`}>
                              {item.title}
                            </h3>
                            {item.id === 2 && (
                              <span className="px-3 py-1 bg-white text-[#800020] text-sm font-bold rounded-full">
                                25% OFF
                              </span>
                            )}
                          </div>
                          <p className={`text-base md:text-lg ${item.id === 2 ? 'text-white/90' : 'text-gray-700'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Right CTA */}
                      <div className="flex items-center gap-4">
                        <Link 
                          href={item.link}
                          className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition-all duration-300 ${
                            item.id === 2 
                              ? 'bg-white text-[#800020] hover:bg-gray-50 hover:scale-105 hover:shadow-lg' 
                              : 'bg-[#800020] text-white hover:bg-[#b76e79] hover:scale-105 hover:shadow-lg'
                          }`}
                        >
                          {item.id === 2 ? 'Shop Sale' : 'Explore Now'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons - Desktop Only */}
          <div className="hidden md:block">
            <button
              onClick={prevSlide}
              className="absolute p-3 transition-all duration-300 -translate-y-1/2 rounded-full shadow-lg left-4 top-1/2 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 group"
            >
              <ChevronLeft size={24} className="text-[#800020] group-hover:text-[#b76e79]" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute p-3 transition-all duration-300 -translate-y-1/2 rounded-full shadow-lg right-4 top-1/2 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 group"
            >
              <ChevronRight size={24} className="text-[#800020] group-hover:text-[#b76e79]" />
            </button>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-6 md:mt-8">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative transition-all duration-300 ${
                  index === currentSlide ? 'w-10' : 'w-3 hover:w-5'
                }`}
              >
                <div className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-[#b76e79] to-[#800020]' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`} />
                {index === currentSlide && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#800020] rounded-full animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-6 -right-6 w-32 h-32 border border-[#b76e79]/10 rounded-full hidden md:block" />
        <div className="absolute -bottom-6 -left-6 w-40 h-40 border border-[#800020]/5 rounded-full hidden md:block" />
      </div>
    </section>
  );
}