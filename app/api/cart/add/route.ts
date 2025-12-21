// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ci.*, p.name, p.images[1] as image, p.slug as product_slug,
              COALESCE(v.price, p.price) as final_price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants v ON ci.variant_id = v.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [session.user.id]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { productId, variantId, quantity, selectedLength, selectedColor } = body;

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // Check if item already exists in cart
    const existing = await client.query(
      `SELECT id, quantity FROM cart_items 
       WHERE user_id = $1 AND product_id = $2 AND variant_id = $3
       AND selected_length = $4 AND selected_color = $5`,
      [session.user.id, productId, variantId || null, selectedLength || null, selectedColor || null]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      await client.query(
        `UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2`,
        [quantity || 1, existing.rows[0].id]
      );
    } else {
      // Insert new item
      await client.query(
        `INSERT INTO cart_items 
         (user_id, product_id, variant_id, quantity, selected_length, selected_color)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          session.user.id,
          productId,
          variantId || null,
          quantity || 1,
          selectedLength || null,
          selectedColor || null,
        ]
      );
    }

    return NextResponse.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}