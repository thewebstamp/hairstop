// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendAdminNotificationEmail, sendOrderStatusEmail } from '@/lib/email-admin';
import { verifyAdmin } from '@/lib/admin-auth';

// GET: Fetch all orders with filters
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    
    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error || 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      let query = `
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any[] = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND o.status = $${paramCount}`;
        params.push(status);
      }

      if (search) {
        paramCount++;
        query += ` AND (
          o.order_number ILIKE $${paramCount} OR 
          u.name ILIKE $${paramCount} OR 
          u.email ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      if (startDate) {
        paramCount++;
        query += ` AND o.created_at >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND o.created_at <= $${paramCount}`;
        params.push(endDate);
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total ${query}`,
        params
      );
      const total = parseInt(countResult.rows[0]?.total) || 0;

      // Get orders with pagination
      params.push(limit);
      params.push(offset);
      
      const ordersResult = await client.query(
        `SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
         ${query}
         ORDER BY o.created_at DESC
         LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
        params
      );

      return NextResponse.json({
        success: true,
        orders: ordersResult.rows.map(order => ({
          ...order,
          shipping_address: typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address)
            : order.shipping_address || {},
          billing_address: typeof order.billing_address === 'string'
            ? JSON.parse(order.billing_address)
            : order.billing_address || {},
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update order status
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    
    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error || 'Unauthorized' 
      }, { status: 401 });
    }

    const { orderId, status, notes } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'payment_pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Get current order details for email
      const orderResult = await client.query(
        `SELECT o.*, u.email as customer_email, COALESCE(u.name, 'Customer') as customer_name
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      const order = orderResult.rows[0];

      // Update order status
      await client.query(
        `UPDATE orders 
         SET status = $1, 
             notes = COALESCE($2, notes),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [status, notes, orderId]
      );

      // Send email to customer about status update
      if (order.customer_email) {
        await sendOrderStatusEmail({
          to: order.customer_email,
          name: order.customer_name,
          orderNumber: order.order_number,
          orderId: order.id,
          oldStatus: order.status,
          newStatus: status,
          notes,
        });
      }

      // Send notification to business email
      await sendAdminNotificationEmail({
        orderNumber: order.order_number,
        orderId: order.id,
        customerName: order.customer_name,
        newStatus: status,
      });

      return NextResponse.json({
        success: true,
        message: 'Order status updated successfully',
        order: {
          id: orderId,
          status,
          updatedAt: new Date().toISOString(),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}