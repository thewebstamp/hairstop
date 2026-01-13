// app/(public)/shop/CraftsmanshipHeader.tsx
'use client';

import { Sparkles, Clock, Crown, Diamond, Star} from 'lucide-react';
import { motion } from 'framer-motion';

const CraftsmanshipHeader = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 mb-12 mt-6 shadow-2xl border border-[#e6d0c6]/50 bg-linear-to-br from-white via-[#faf9f6] to-[#f7e7ce]/30">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Geometric pattern */}
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #800020 0.5px, transparent 0.5px),
              radial-gradient(circle at 75% 75%, #b76e79 0.5px, transparent 0.5px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo pattern - more prominent */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/logo1.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '180px 180px',
            backgroundPosition: 'center',
            transform: 'rotate(15deg)',
          }}
        />

        {/* Gold foil effect */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4af37' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-white/90 via-transparent to-[#f7e7ce]/30" />
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-white/90 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-6 py-10 md:px-12 md:py-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Top Badge - Gold Accent */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-fit flex items-center justify-center gap-3 text-center mx-auto mb-5 px-6 py-3 rounded-full bg-linear-to-r from-white/90 to-[#faf9f6] shadow-lg border border-[#e6d0c6] relative overflow-hidden group"
          >
            {/* Animated gold bar */}
            <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-[#d4af37] via-[#f4d03f] to-[#d4af37]" />
            <div className="absolute right-0 top-0 h-full w-1 bg-linear-to-b from-[#d4af37] via-[#f4d03f] to-[#d4af37]" />

            <Diamond className="h-4 w-4 text-[#d4af37] animate-pulse" />
            <span className="text-sm font-semibold text-[#800020] tracking-widest uppercase">
              Bespoke Process
            </span>
            <Star className="h-4 w-4 text-[#d4af37] animate-pulse" />
          </motion.div>

          {/* Main Header with Gold Gradient */}
          <div className="text-center mb-12 lg:mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-[40px] md:text-6xl lg:text-7xl font-bold mb-8 leading-none tracking-tight"
            >
              <span className="relative">
                <span className="absolute -inset-1 bg-linear-to-r from-[#d4af37]/30 via-[#f4d03f]/20 to-[#d4af37]/30 blur-xl rounded-full opacity-90" />
                <span className="relative bg-clip-text text-transparent bg-linear-to-r from-[#800020] via-[#b76e79] to-[#800020]">
                  Wearable Art
                </span>
              </span>
              <br />
              <span className="mt-2 block">
                <span className="text-[#111827]">Meticulously</span>{' '}
                <span className="pt-2 block relative">
                  Crafted
                </span>
              </span>
            </motion.h1>

            {/* Subheader with Gold Accent */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-800 max-w-2xl mx-auto font-medium leading-relaxed relative"
            >
              <span className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-1 w-4 bg-linear-to-r from-[#d4af37] to-[#f4d03f] rounded-full" />
              Each piece is commissioned upon order by international artisans, representing
              <span className="text-[#111827] font-semibold"> the peak of luxury and perfection.</span>
              <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-1 w-4 bg-linear-to-l from-[#d4af37] to-[#f4d03f] rounded-full" />
            </motion.p>
          </div>

          {/* Gold Banner Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 lg:mt-14"
          >
            <div className="relative overflow-hidden rounded-xl">
              {/* Gold gradient background */}
              <div className="absolute inset-0 bg-linear-to-r from-[#d4af37]/10 via-[#f4d03f]/5 to-[#d4af37]/10" />

              {/* Border effect */}
              <div className="absolute inset-0 border border-[#d4af37]/20" />

              {/* Animated gold particles */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#d4af37] to-transparent animate-pulse" />

              <div className="relative px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  <Clock className="h-6 w-6 text-[#d4af37] shrink-0" />
                  <p className="text-lg font-medium text-gray-800 text-center">
                    <span className="text-[#111827] font-bold">Each masterpiece receives</span>{' '}
                    <span className="relative">
                      <span className="text-[#800020] font-bold px-1">14-21 days</span>
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#d4af37] to-transparent" />
                    </span>{' '}
                    <span className="text-[#111827] font-bold">of dedicated artisan attention</span>
                  </p>
                  <Crown className="h-6 w-6 text-[#d4af37] shrink-0" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-16 right-16 opacity-10 lg:opacity-50">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-[#d4af3728] to-[#f4d03f2c] rounded-full blur-md" />
              <Sparkles className="relative h-32 w-32 text-[#d4af37]" />
            </div>
          </div>
          <div className="absolute bottom-16 left-16 opacity-10 lg:opacity-50">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-[#80002028] to-[#b76e792a] rounded-full blur-md" />
              <Crown className="relative h-28 w-28 text-[#800020]" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gold Border */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-0.5 bg-linear-to-r from-transparent via-[#d4af37] to-transparent rounded-full" />
    </div>
  );
};

export default CraftsmanshipHeader;