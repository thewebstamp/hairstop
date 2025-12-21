/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch single customer details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const customerId = parseInt(id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Get customer details
      const customerQuery = `
        SELECT 
          u.*,
          COALESCE(o.order_count, 0) as order_count,
          COALESCE(o.total_spent, 0) as total_spent,
          COALESCE(o.avg_order_value, 0) as avg_order_value
        FROM users u
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as order_count,
            SUM(total_amount) as total_spent,
            AVG(total_amount) as avg_order_value
          FROM orders 
          WHERE user_id = $1
          GROUP BY user_id
        ) o ON u.id = o.user_id
        WHERE u.id = $1
      `;

      const customerResult = await client.query(customerQuery, [customerId]);

      if (customerResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }

      const customer = customerResult.rows[0];

      // Get customer's recent orders (last 10)
      const ordersQuery = `
        SELECT 
          o.*,
          COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `;

      const ordersResult = await client.query(ordersQuery, [customerId]);

      // Get customer's address if exists
      let address = null;
      if (customer.address) {
        try {
          address = typeof customer.address === 'string' 
            ? JSON.parse(customer.address)
            : customer.address;
        } catch {
          address = null;
        }
      }

      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          role: customer.role,
          email_verified: customer.email_verified,
          provider: customer.provider,
          image: customer.image,
          created_at: customer.created_at,
          last_login: customer.last_login,
          address: address,
          stats: {
            order_count: parseInt(customer.order_count) || 0,
            total_spent: parseFloat(customer.total_spent) || 0,
            avg_order_value: parseFloat(customer.avg_order_value) || 0,
          }
        },
        recent_orders: ordersResult.rows || [],
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PATCH: Update customer details (name, phone only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const customerId = parseInt(id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const { name, phone } = await request.json();

    if (!name && !phone) {
      return NextResponse.json(
        { success: false, error: 'Name or phone is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(name);
        paramIndex++;
      }

      if (phone !== undefined) {
        updates.push(`phone = $${paramIndex}`);
        values.push(phone);
        paramIndex++;
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      paramIndex++;
      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, name, phone, role
      `;
      values.push(customerId);

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Customer details updated successfully',
        customer: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating customer details:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update customer',
        message: error.message
      },
      { status: 500 }
    );
  }
}