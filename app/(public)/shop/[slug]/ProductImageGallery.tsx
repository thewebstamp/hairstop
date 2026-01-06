'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  featured?: boolean;
  stock: number;
}

export default function ProductImageGallery({ 
  images, 
  productName, 
  featured = false, 
  stock 
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const minSwipeDistance = 50;

  // FIX: Simple header hiding for sticky headers
  useEffect(() => {
    if (isModalOpen) {
      // Hide all headers when modal opens
      document.querySelectorAll('header').forEach(header => {
        (header as HTMLElement).style.display = 'none';
      });
      // Also hide the top banner div before the header
      const header = document.querySelector('header');
      if (header && header.previousElementSibling) {
        (header.previousElementSibling as HTMLElement).style.display = 'none';
      }
    } else {
      // Show all headers when modal closes
      document.querySelectorAll('header').forEach(header => {
        (header as HTMLElement).style.display = '';
      });
      // Also show the top banner div
      const header = document.querySelector('header');
      if (header && header.previousElementSibling) {
        (header.previousElementSibling as HTMLElement).style.display = '';
      }
    }
  }, [isModalOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setIsZoomed(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setIsZoomed(false);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          setIsModalOpen(false);
          break;
        case ' ':
          setIsZoomed(!isZoomed);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, goToPrevious, goToNext, isZoomed]);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  return (
    <>
      {/* Main Gallery Section */}
      <div>
        {/* Main Image Container */}
        <div className="relative bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl shadow-[#800020]/5 border border-white/50 mb-6 group">
          <div className="aspect-square relative cursor-zoom-in">
            {images[selectedIndex] ? (
              <Image
                src={images[selectedIndex]}
                alt={productName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onClick={() => setIsModalOpen(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8]">
                <div className="text-center">
                  <div className="text-6xl opacity-30 mb-4">💇‍♀️</div>
                  <p className="text-sm text-[#800020] opacity-50">Premium Hair</p>
                </div>
              </div>
            )}
            
            {/* Image Overlay Gradient & Click Indicator */}
            <div 
              className="absolute inset-0 bg-linear-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform -translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Maximize2 className="w-6 h-6 text-[#800020]" />
                </div>
              </div>
            </div>
            
            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 left-4">
                <div className="bg-linear-to-r from-[#800020] to-[#b76e79] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>Featured</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stock Status */}
            {/* <div className="absolute top-4 right-4">
              <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm border ${
                stock > 0 
                  ? 'bg-linear-to-r from-emerald-500/90 to-emerald-600/90 text-white border-emerald-200/30' 
                  : 'bg-linear-to-r from-rose-500/90 to-rose-600/90 text-white border-rose-200/30'
              }`}>
                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
              </div>
            </div> */}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={`relative aspect-square bg-linear-to-br from-white to-[#faf9f6]/80 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer group ${
                  selectedIndex === index
                    ? 'border-[#800020] ring-2 ring-[#800020]/30 shadow-lg'
                    : 'border-white/50 hover:border-[#b76e79]/50 hover:shadow-md'
                }`}
              >
                <Image
                  src={image}
                  alt={`${productName} - View ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
                <div className={`absolute inset-0 bg-linear-to-t ${
                  selectedIndex === index
                    ? 'from-[#800020]/20 via-transparent to-transparent'
                    : 'from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100'
                } transition-opacity duration-300`} />
                
                {/* Selection Indicator */}
                {selectedIndex === index && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-linear-to-br from-[#800020] to-[#b76e79] rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-9999 bg-linear-to-br from-[#0a0a0a] to-[#1a1a1a] flex flex-col">
          {/* Header with Controls */}
          <div className="flex items-center justify-between p-4 sm:p-6 bg-linear-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white" />
              </button>
              
              <div className="text-white">
                <h3 className="font-semibold text-sm sm:text-base">{productName}</h3>
                <div className="text-xs sm:text-sm text-white/60">
                  Image {selectedIndex + 1} of {images.length}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-all duration-300"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Zoom Out</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Zoom In</span>
                  </>
                )}
              </button>
              
              <div className="px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-medium">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </div>

          {/* Main Image Area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group/arrow"
            >
              <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 text-white/80 group-hover/arrow:text-white" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group/arrow"
            >
              <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 text-white/80 group-hover/arrow:text-white" />
            </button>

            {/* Touch Area for Mobile Swiping */}
            <div
              className="w-full h-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* Zoom Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                {images[selectedIndex] && (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    {/* Zoom Effect Overlay */}
                    {isZoomed && (
                      <div className="absolute inset-0 z-10 overflow-hidden">
                        <div 
                          className="absolute inset-0 scale-150 transform-gpu"
                          style={{
                            backgroundImage: `url(${images[selectedIndex]})`,
                            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            backgroundSize: '200%',
                            filter: 'blur(0.5px)',
                            transition: 'background-position 0.1s'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Main Image */}
                    <div className="relative max-w-6xl max-h-[80vh] w-full h-full">
                      <Image
                        src={images[selectedIndex]}
                        alt={`${productName} - View ${selectedIndex + 1}`}
                        fill
                        className={`object-contain ${isZoomed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        sizes="100vw"
                        quality={100}
                      />
                    </div>
                    
                    {/* Zoom Indicator */}
                    {isZoomed && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden sm:block">
                        <div className="px-4 py-2.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span>Drag to explore details • Click to exit zoom</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip at Bottom */}
          <div className="p-4 sm:p-6 bg-linear-to-t from-black/80 to-transparent">
            <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto py-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedIndex === index
                      ? 'border-white ring-1 ring-white/50 scale-105'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 48px, 64px"
                  />
                  
                  {/* Active Indicator */}
                  {selectedIndex === index && (
                    <div className="absolute inset-0 bg-white/10" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Mobile Zoom Button */}
            <div className="sm:hidden mt-4 flex justify-center">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-4 h-4" />
                    <span>Zoom Out</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4" />
                    <span>Zoom In</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Swipe Instruction for Mobile */}
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3 text-white/60" />
                  <span className="text-xs text-white/60">Swipe to navigate</span>
                  <ChevronRight className="w-3 h-3 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for Scrollbar Hide */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .transform-gpu {
          transform: translateZ(0);
        }
      `}</style>
    </>
  );
}