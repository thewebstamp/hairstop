// app/(public)/shop/[slug]/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <div className="space-x-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Try again
        </button>
        <Link
          href="/shop"
          className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}