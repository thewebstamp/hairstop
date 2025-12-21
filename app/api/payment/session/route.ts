// app/api/payment/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { orderId, sessionId } = await request.json();
    
    const client = await pool.connect();
    
    try {
      // Create or update payment session
      await client.query(
        `INSERT INTO payment_sessions (order_id, user_id, session_id, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (order_id) DO UPDATE
         SET session_id = $3, updated_at = CURRENT_TIMESTAMP`,
        [orderId, session.user.id, sessionId]
      );
      
      return NextResponse.json({ success: true, sessionId });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving payment session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM payment_sessions WHERE order_id = $1 AND user_id = $2',
        [orderId, session.user.id]
      );
      
      return NextResponse.json({
        hasSession: result.rows.length > 0,
        session: result.rows[0] || null
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching payment session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}