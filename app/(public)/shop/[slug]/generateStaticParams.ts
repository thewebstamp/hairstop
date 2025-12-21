// app/(public)/shop/[slug]/generateStaticParams.ts
import { getAllProductSlugs } from '@/lib/data';

// This function generates static paths for all products
export async function generateStaticParams() {
  try {
    const products = await getAllProductSlugs();
    
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}