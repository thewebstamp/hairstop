// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

// IMPORTANT: params is now a Promise in Next.js 13+
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    
    console.log('API: Got product ID from resolved params:', productId);
    
    // Verify admin access
    const authResult = await verifyAdmin();
    
    if (!authResult.success) {
      console.log('API: Admin verification failed:', authResult.error);
      return NextResponse.json({ 
        error: authResult.error || 'Unauthorized' 
      }, { status: 401 });
    }

    if (!productId) {
      console.log('API: No product ID provided');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const numericId = parseInt(productId, 10);
    
    if (isNaN(numericId)) {
      console.log('API: Invalid numeric product ID:', productId);
      return NextResponse.json(
        { error: `Invalid product ID: ${productId}. Must be a number.` },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      console.log('API: Querying database for product ID:', numericId);
      
      // Get product with category name
      const productResult = await client.query(
        `SELECT p.*, c.name as category_name 
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1`,
        [numericId]
      );

      console.log('API: Product query returned', productResult.rows.length, 'rows');

      if (productResult.rows.length === 0) {
        return NextResponse.json(
          { error: `Product not found with ID: ${numericId}` },
          { status: 404 }
        );
      }

      const product = productResult.rows[0];

      // Get product variants
      const variantsResult = await client.query(
        `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY length, color`,
        [numericId]
      );

      console.log('API: Found variants:', variantsResult.rows.length);

      return NextResponse.json({
        success: true,
        product: {
          ...product,
          variants: variantsResult.rows,
        },
      });
    } catch (error) {
      console.error('API: Database error:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API: Error fetching product:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}