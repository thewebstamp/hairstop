// app/api/admin/orders/bulk/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendOrderStatusEmail, sendAdminNotificationEmail } from '@/lib/email-admin';
import { verifyAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    
    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error || 'Unauthorized' 
      }, { status: 401 });
    }

    const { orderIds, status, notes } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
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
      // Get orders for email notifications
      const ordersResult = await client.query(
        `SELECT o.*, u.email as customer_email, COALESCE(u.name, 'Customer') as customer_name
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = ANY($1)`,
        [orderIds]
      );

      const orders = ordersResult.rows;

      // Update all orders
      await client.query(
        `UPDATE orders 
         SET status = $1, 
             notes = COALESCE($2, notes),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ANY($3)`,
        [status, notes, orderIds]
      );

      // Send emails for each order
      const emailPromises = orders.map(async (order) => {
        if (order.customer_email && order.status !== status) {
          try {
            await sendOrderStatusEmail({
              to: order.customer_email,
              name: order.customer_name,
              orderNumber: order.order_number,
              orderId: order.id,
              oldStatus: order.status,
              newStatus: status,
              notes,
            });
          } catch (error) {
            console.error(`Failed to send email for order ${order.id}:`, error);
          }
        }
      });

      await Promise.allSettled(emailPromises);

      // Send admin notification
      try {
        await sendAdminNotificationEmail({
          orderNumber: `${orderIds.length} orders`,
          orderId: orderIds[0],
          customerName: `${orders.length} customers`,
          newStatus: status,
        });
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }

      return NextResponse.json({
        success: true,
        message: `${orderIds.length} order(s) updated successfully`,
        updatedCount: orderIds.length,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating bulk orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}