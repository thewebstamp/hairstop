// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access using NextAuth session
    const authResult = await verifyAdmin();
    
    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error || 'Unauthorized' 
      }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      // Get today's date
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      // Execute multiple queries in parallel
      const [
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        totalOrders,
        todayOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        topProducts,
      ] = await Promise.all([
        // Total revenue
       client.query(
          `SELECT COALESCE(SUM(total_amount), 0) as amount FROM orders WHERE status = 'delivered'`
        ),
        // Today's revenue
        client.query(
          `SELECT COALESCE(SUM(total_amount), 0) as amount FROM orders 
           WHERE status = 'delivered' AND created_at >= $1`,
          [startOfToday]
        ),
        // This month's revenue
        client.query(
          `SELECT COALESCE(SUM(total_amount), 0) as amount FROM orders 
           WHERE status = 'delivered' AND created_at >= $1`,
          [startOfMonth]
        ),
        // Total orders
        client.query(`SELECT COUNT(*) as count FROM orders`),
        // Today's orders
        client.query(
          `SELECT COUNT(*) as count FROM orders WHERE created_at >= $1`,
          [startOfToday]
        ),
        // Total products
        client.query(`SELECT COUNT(*) as count FROM products`),
        // Total customers
        client.query(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`),
        // Pending orders
        client.query(
          `SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'payment_pending', 'processing')`
        ),
        // Low stock products
        client.query(
          `SELECT COUNT(*) as count FROM products WHERE stock < 10`
        ),
        // Recent orders (last 5)
        client.query(`
          SELECT 
            o.id, 
            o.order_number, 
            COALESCE(u.name, 'Guest') as customer_name, 
            o.total_amount, 
            o.status, 
            o.created_at,
            COUNT(oi.id) as item_count
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          GROUP BY o.id, u.name
          ORDER BY o.created_at DESC
          LIMIT 5
        `),
        // Top selling products
        client.query(`
          SELECT 
            p.id,
            p.name,
            p.images[1] as image,
            COALESCE(SUM(oi.quantity), 0) as total_sold,
            COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.status = 'delivered'
          GROUP BY p.id, p.name, p.images
          ORDER BY revenue DESC
          LIMIT 5
        `),
      ]);

      // Get sales data for chart (last 30 days)
      const salesChart = await client.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date
      `);

      return NextResponse.json({
        success: true,
        stats: {
          totalRevenue: parseFloat(totalRevenue.rows[0]?.amount) || 0,
          todayRevenue: parseFloat(todayRevenue.rows[0]?.amount) || 0,
          monthlyRevenue: parseFloat(monthlyRevenue.rows[0]?.amount) || 0,
          totalOrders: parseInt(totalOrders.rows[0]?.count) || 0,
          todayOrders: parseInt(todayOrders.rows[0]?.count) || 0,
          totalProducts: parseInt(totalProducts.rows[0]?.count) || 0,
          totalCustomers: parseInt(totalCustomers.rows[0]?.count) || 0,
          pendingOrders: parseInt(pendingOrders.rows[0]?.count) || 0,
          lowStockProducts: parseInt(lowStockProducts.rows[0]?.count) || 0,
          recentOrders: recentOrders.rows || [],
          topProducts: topProducts.rows || [],
          salesChart: salesChart.rows || [],
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}