// app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch all customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      // Build WHERE conditions
      const conditions: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values: any[] = [];
      let paramIndex = 1;

      if (search) {
        conditions.push(`(
          u.name ILIKE $${paramIndex} OR 
          u.email ILIKE $${paramIndex} OR
          u.phone ILIKE $${paramIndex}
        )`);
        values.push(`%${search}%`);
        paramIndex++;
      }

      if (role && role !== 'all') {
        conditions.push(`u.role = $${paramIndex}`);
        values.push(role);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM users u
        ${whereClause}
      `;
      
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0]?.total || '0');

      // Get customers with pagination
      const customersQuery = `
        SELECT 
          u.id,
          u.email,
          u.name,
          u.phone,
          u.role,
          u.email_verified,
          u.created_at,
          u.last_login,
          u.verification_token,
          u.reset_token,
          u.provider,
          COALESCE(o.order_count, 0) as order_count,
          COALESCE(o.total_spent, 0) as total_spent
        FROM users u
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as order_count,
            SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_spent
          FROM orders 
          GROUP BY user_id
        ) o ON u.id = o.user_id

        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const queryParams = [...values, limit, offset];
      const customersResult = await client.query(customersQuery, queryParams);

      return NextResponse.json({
        success: true,
        customers: customersResult.rows,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error, check network connection',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT: Update customer role or details
export async function PUT(request: NextRequest) {
  try {
    const { userId, name, phone } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Do NOT allow role changes in the API
    // Role can only be set by the system or during user creation

    const client = await pool.connect();

    try {
      // Build update query (exclude role from updates)
      const updates: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      if (updates.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      paramIndex++;
      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, name, role, phone
      `;
      values.push(userId);

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Customer updated successfully',
        customer: result.rows[0],
      });
    } finally {
      client.release();
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating customer:', error);
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