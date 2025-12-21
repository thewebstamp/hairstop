// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Providers from './Providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: {
    default: 'Hair Stop - Luxury Hair Boutique',
    template: '%s | Hair Stop'
  },
  description: 'Your first stop for quality and luxury hair. Premium human hair bundles, wigs, and frontals delivered to Nigeria with confidence in craft and beauty.',
  keywords: ['human hair', 'hair bundles', 'wigs', 'frontals', 'luxury hair', 'Nigeria', 'hair shop'],
  authors: [{ name: 'Hair Stop' }],
  creator: 'Hair Stop',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hairstop.ng'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hairstop.ng',
    title: 'Hair Stop - Luxury Hair Boutique',
    description: 'Premium human hair bundles, wigs, frontals and closures',
    siteName: 'Hair Stop',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hair Stop Luxury Hair',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hair Stop - Luxury Hair Boutique',
    description: 'Premium human hair bundles, wigs, and frontals',
    images: ['/twitter-image.png'],
    creator: '@hairstopng',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}