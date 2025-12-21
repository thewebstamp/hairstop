// app/(public)/shop/page.tsx
import { Suspense } from 'react';
import ShopContent from './ShopContent';
import { getCategories, getProducts } from '@/lib/data';
import LoadingSkeleton from './LoadingSkeleton';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; minPrice?: string; maxPrice?: string; page?: string }>;
}) {
  // Await the searchParams
  const params = await searchParams;
  
  // Parse and prepare filters
  const category = params.category || '';
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const page = params.page ? parseInt(params.page) : 1;
  const itemsPerPage = 12;

  // Fetch data directly (no server action)
  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getProducts({
      category: category || undefined,
      minPrice,
      maxPrice,
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
    }),
  ]);

  const initialData = {
    categories,
    products,
    total,
    page,
    totalPages: Math.ceil(total / itemsPerPage),
  };

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ShopContent
        initialData={initialData}
        searchParams={params}
      />
    </Suspense>
  );
}