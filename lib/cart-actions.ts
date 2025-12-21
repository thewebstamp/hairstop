// app/lib/cart-actions.ts
'use server';

import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function getCartItems() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT ci.*, p.name, p.images[1] as image, p.price as base_price,
             COALESCE(v.price, p.price) as final_price, p.slug as product_slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants v ON ci.variant_id = v.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `, [userId]);
    
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateCartQuantity(itemId: number, quantity: number) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    // Verify this cart item belongs to the current user
    const verifyResult = await client.query(
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );
    
    if (verifyResult.rows.length === 0) {
      throw new Error('Cart item not found or does not belong to user');
    }
    
    await client.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
      [quantity, itemId, userId]
    );
  } finally {
    client.release();
  }
}

export async function removeFromCart(itemId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    // Verify this cart item belongs to the current user
    const verifyResult = await client.query(
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );
    
    if (verifyResult.rows.length === 0) {
      throw new Error('Cart item not found or does not belong to user');
    }
    
    await client.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );
  } finally {
    client.release();
  }
}

export async function clearCart() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return;
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    await client.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );
  } finally {
    client.release();
  }
}