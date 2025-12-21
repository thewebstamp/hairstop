// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

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
    const range = searchParams.get('range') || '30d';
    
    let dateFilter = '';
    switch (range) {
      case '7d':
        dateFilter = 'INTERVAL \'7 days\'';
        break;
      case '30d':
        dateFilter = 'INTERVAL \'30 days\'';
        break;
      case '90d':
        dateFilter = 'INTERVAL \'90 days\'';
        break;
      case '1y':
        dateFilter = 'INTERVAL \'1 year\'';
        break;
      default:
        dateFilter = 'INTERVAL \'30 days\'';
    }

    const client = await pool.connect();

    try {
      // Get analytics data
      const [
        revenueData,
        orderData,
        customerData,
        salesChartData,
        topProductsData,
        categoryData
      ] = await Promise.all([
        // Revenue data
        client.query(`
          SELECT 
            COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 day' THEN total_amount ELSE 0 END), 0) as today_revenue,
            COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - ${dateFilter} THEN total_amount ELSE 0 END), 0) as period_revenue,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(AVG(total_amount), 0) as avg_order_value
          FROM orders 
          WHERE status = 'delivered'
        `),
        
        // Order data
        client.query(`
          SELECT 
            COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as today_orders,
            COUNT(CASE WHEN created_at >= CURRENT_DATE - ${dateFilter} THEN 1 END) as period_orders,
            COUNT(*) as total_orders
          FROM orders 
          WHERE status = 'delivered'
        `),
        
        // Customer data
        client.query(`
          SELECT 
            COUNT(*) as total_customers,
            COUNT(CASE WHEN created_at >= CURRENT_DATE - ${dateFilter} THEN 1 END) as new_customers
          FROM users 
          WHERE role = 'customer'
        `),
        
        // Sales chart data
        client.query(`
          SELECT 
            DATE(created_at) as date,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as order_count
          FROM orders 
          WHERE status = 'delivered' 
            AND created_at >= CURRENT_DATE - ${dateFilter}
          GROUP BY DATE(created_at)
          ORDER BY date
        `),
        
        // Top products
        client.query(`
          SELECT 
            p.name,
            COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
            COALESCE(SUM(oi.quantity), 0) as quantity_sold
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.status = 'delivered' 
            AND o.created_at >= CURRENT_DATE - ${dateFilter}
          GROUP BY p.id, p.name
          ORDER BY revenue DESC
          LIMIT 10
        `),
        
        // Category distribution
        client.query(`
          SELECT 
            c.name as category,
            COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
            COUNT(DISTINCT o.id) as order_count
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN categories c ON p.category_id = c.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.status = 'delivered' 
            AND o.created_at >= CURRENT_DATE - ${dateFilter}
          GROUP BY c.id, c.name
          ORDER BY revenue DESC
        `)
      ]);

      // Calculate conversion rate (simplified)
      const totalVisitors = 1000; // This would come from analytics
      const periodOrders = parseInt(orderData.rows[0]?.period_orders) || 0;
      const conversionRate = periodOrders > 0 
        ? (periodOrders / totalVisitors) * 100 
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          totalRevenue: parseFloat(revenueData.rows[0]?.total_revenue) || 0,
          todayRevenue: parseFloat(revenueData.rows[0]?.today_revenue) || 0,
          monthlyRevenue: parseFloat(revenueData.rows[0]?.period_revenue) || 0,
          totalOrders: parseInt(orderData.rows[0]?.total_orders) || 0,
          todayOrders: parseInt(orderData.rows[0]?.today_orders) || 0,
          totalCustomers: parseInt(customerData.rows[0]?.total_customers) || 0,
          newCustomers: parseInt(customerData.rows[0]?.new_customers) || 0,
          averageOrderValue: parseFloat(revenueData.rows[0]?.avg_order_value) || 0,
          conversionRate,
          salesChart: salesChartData.rows || [],
          topProducts: topProductsData.rows || [],
          categoryDistribution: categoryData.rows || [],
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}