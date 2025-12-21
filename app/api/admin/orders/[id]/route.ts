// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  sendOrderStatusEmail,
  sendAdminNotificationEmail,
} from "@/lib/email-admin";
import { verifyAdmin } from "@/lib/admin-auth";

// GET: Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Extract order ID from context
    const { id } = await params; // Await the params
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Get order with user details
      const orderResult = await client.query(
        `
        SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = $1
      `,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const order = orderResult.rows[0];

      // Get order items with product details
      const itemsResult = await client.query(
        `
        SELECT 
          oi.*,
          p.name as product_name,
          p.images[1] as product_image,
          p.slug as product_slug
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        ORDER BY oi.created_at
      `,
        [orderId]
      );

      // Get payment proof file if exists
      const fileResult = await client.query(
        `
        SELECT * FROM uploaded_files 
        WHERE order_id = $1 
        ORDER BY uploaded_at DESC
        LIMIT 1
      `,
        [orderId]
      );

      return NextResponse.json({
        success: true,
        order: {
          ...order,
          shipping_address:
            typeof order.shipping_address === "string"
              ? JSON.parse(order.shipping_address)
              : order.shipping_address || {},
          billing_address:
            typeof order.billing_address === "string"
              ? JSON.parse(order.billing_address)
              : order.billing_address || {},
          items: itemsResult.rows,
          payment_proof: fileResult.rows[0] || null,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Extract order ID from context
    const { id } = context.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const { status, notes } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "pending",
      "payment_pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const order = orderResult.rows[0];
      const oldStatus = order.status;

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
      if (order.customer_email && oldStatus !== status) {
        try {
          await sendOrderStatusEmail({
            to: order.customer_email,
            name: order.customer_name,
            orderNumber: order.order_number,
            orderId: order.id,
            oldStatus: oldStatus,
            newStatus: status,
            notes,
          });
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
          // Don't fail the whole request if email fails
        }
      }

      // Send notification to admin
      if (oldStatus !== status) {
        try {
          await sendAdminNotificationEmail({
            orderNumber: order.order_number,
            orderId: order.id,
            customerName: order.customer_name,
            newStatus: status,
          });
        } catch (notificationError) {
          console.error(
            "Failed to send admin notification:",
            notificationError
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: "Order status updated successfully",
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
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
