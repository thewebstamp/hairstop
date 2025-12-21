// lib/admin-data.ts
import pool from './db';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentOrders: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lowStockProducts: any[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const client = await pool.connect();
  try {
    // Get total revenue
    const revenueResult = await client.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status = 'completed'`
    );
    
    // Get total orders
    const ordersResult = await client.query(
      `SELECT COUNT(*) as total_orders FROM orders`
    );
    
    // Get pending orders
    const pendingResult = await client.query(
      `SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending'`
    );
    
    // Get total products
    const productsResult = await client.query(
      `SELECT COUNT(*) as total_products FROM products`
    );
    
    // Get recent orders (last 5)
    const recentOrdersResult = await client.query(`
      SELECT 
        o.id, 
        o.order_number, 
        o.customer_name, 
        o.total_amount, 
        o.status, 
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    // Get low stock products (stock < 10)
    const lowStockResult = await client.query(`
      SELECT 
        id, 
        name, 
        stock, 
        price,
        (SELECT name FROM categories WHERE id = p.category_id) as category_name
      FROM products p
      WHERE stock < 10
      ORDER BY stock ASC
      LIMIT 5
    `);

    return {
      totalRevenue: parseFloat(revenueResult.rows[0]?.total_revenue || '0'),
      totalOrders: parseInt(ordersResult.rows[0]?.total_orders || '0'),
      totalProducts: parseInt(productsResult.rows[0]?.total_products || '0'),
      pendingOrders: parseInt(pendingResult.rows[0]?.pending_orders || '0'),
      recentOrders: recentOrdersResult.rows,
      lowStockProducts: lowStockResult.rows,
    };
  } finally {
    client.release();
  }
}

// Get orders for admin
export async function getOrders(page: number = 1, limit: number = 20) {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await client.query(`SELECT COUNT(*) as total FROM orders`);
    const total = parseInt(countResult.rows[0].total);
    
    // Get orders with pagination
    const ordersResult = await client.query(`
      SELECT 
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return {
      orders: ordersResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } finally {
    client.release();
  }
}

// Get order details
export async function getOrderDetails(orderId: number) {
  const client = await pool.connect();
  try {
    const orderResult = await client.query(`
      SELECT o.* FROM orders o WHERE o.id = $1
    `, [orderId]);
    
    const itemsResult = await client.query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.images[1] as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);
    
    return {
      order: orderResult.rows[0],
      items: itemsResult.rows,
    };
  } finally {
    client.release();
  }
}