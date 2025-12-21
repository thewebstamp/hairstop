//lib/checkout-actions
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface BillingAddress {
  sameAsShipping: boolean;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface OrderData {
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  notes?: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}

export interface OrderItem {
  product_id: number;
  variant_id?: number;
  quantity: number;
  price: number;
  selected_length?: string;
  selected_color?: string;
}

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `HS${timestamp.slice(-8)}${random}`;
}

// Create new order
export async function createOrder(orderData: OrderData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { 
      success: false, 
      error: 'You must be logged in to place an order',
      requiresLogin: true 
    };
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, order_number, total_amount, subtotal, shipping_fee,
        shipping_address, billing_address, payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        userId,
        orderNumber,
        orderData.totalAmount,
        orderData.subtotal,
        orderData.shippingFee,
        JSON.stringify(orderData.shippingAddress),
        JSON.stringify(orderData.billingAddress),
        'bank_transfer',
        orderData.notes || null
      ]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Get cart items
    const cartItems = await client.query(
      `SELECT ci.*, p.price as base_price, COALESCE(v.price, p.price) as final_price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants v ON ci.variant_id = v.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    
    // Create order items
    for (const item of cartItems.rows) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, quantity, price,
          selected_length, selected_color
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          orderId,
          item.product_id,
          item.variant_id || null,
          item.quantity,
          item.final_price,
          item.selected_length || null,
          item.selected_color || null
        ]
      );
    }
    
    // Clear cart after order creation
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    await client.query('COMMIT');
    
    revalidatePath('/orders');
    
    return {
      success: true,
      orderId,
      orderNumber,
      message: 'Order created successfully'
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    return {
      success: false,
      error: 'Failed to create order. Please try again.'
    };
  } finally {
    client.release();
  }
}

// Upload proof of payment
export async function uploadProofOfPayment(orderId: number, fileUrl: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { 
      success: false, 
      error: 'You must be logged in to upload proof'
    };
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    // Verify order belongs to user
    const verifyResult = await client.query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    
    if (verifyResult.rows.length === 0) {
      return { 
        success: false, 
        error: 'Order not found or does not belong to user'
      };
    }
    
    // Update order with proof of payment
    await client.query(
      `UPDATE orders 
       SET proof_of_payment_url = $1, status = 'payment_pending', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3`,
      [fileUrl, orderId, userId]
    );
    
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    
    return {
      success: true,
      message: 'Proof of payment uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading proof of payment:', error);
    return {
      success: false,
      error: 'Failed to upload proof of payment'
    };
  } finally {
    client.release();
  }
}

// Get user orders
export async function getUserOrders() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT o.*, 
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    
    return result.rows.map(order => ({
      ...order,
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address)
        : order.shipping_address,
      billing_address: typeof order.billing_address === 'string'
        ? JSON.parse(order.billing_address)
        : order.billing_address
    }));
  } finally {
    client.release();
  }
}

// Get order details
export async function getOrderDetails(orderId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const userId = parseInt(session.user.id);
  const client = await pool.connect();
  
  try {
    // Get order
    const orderResult = await client.query(
      `SELECT o.* FROM orders o
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    const order = orderResult.rows[0];
    
    // Get order items with product details
    const itemsResult = await client.query(
      `SELECT oi.*, p.name, p.slug, p.images[1] as image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at`,
      [orderId]
    );
    
    return {
      ...order,
      shipping_address: typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address,
      billing_address: typeof order.billing_address === 'string'
        ? JSON.parse(order.billing_address)
        : order.billing_address,
      items: itemsResult.rows
    };
  } finally {
    client.release();
  }
}