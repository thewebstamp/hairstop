// app/api/upload/proof/route.ts
// app/api/upload/proof/route.ts (PRODUCTION READY)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  console.log('🔵 Payment proof upload request received');
  
  try {
    // 1. AUTHENTICATION
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('🔴 Unauthorized: No session found');
      return NextResponse.json({ 
        success: false,
        error: 'Please login to upload proof' 
      }, { status: 401 });
    }
    
    const userId = parseInt(session.user.id);
    console.log('🟢 User authenticated:', session.user.email, '(ID:', userId, ')');
    
    // 2. PARSE REQUEST
    const contentType = request.headers.get('content-type') || '';
    console.log('📨 Content-Type:', contentType);
    
    let orderId: number;
    let fileName: string;
    let fileType: string;
    let fileSize: number;
    let fileData: string;
    
    if (contentType.includes('application/json')) {
      // Handle JSON with base64 data (from browser conversion)
      const payload = await request.json();
      
      orderId = parseInt(payload.orderId);
      fileName = payload.fileName || 'payment-proof.jpg';
      fileType = payload.fileType || 'image/jpeg';
      fileSize = payload.fileSize || 0;
      fileData = payload.fileData || '';
      
      console.log('📦 Received JSON payload for order:', orderId);
      
    } else if (contentType.includes('multipart/form-data')) {
      // Handle FormData (fallback)
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const orderIdStr = formData.get('orderId') as string;
      
      if (!file || !orderIdStr) {
        return NextResponse.json({ 
          success: false,
          error: 'File and Order ID are required' 
        }, { status: 400 });
      }
      
      orderId = parseInt(orderIdStr);
      fileName = file.name;
      fileType = file.type;
      fileSize = file.size;
      
      // Convert to base64 for storage
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileData = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      console.log('📋 FormData received for order:', orderId);
      
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Unsupported content type' 
      }, { status: 400 });
    }
    
    // 3. VALIDATION
    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid Order ID' 
      }, { status: 400 });
    }
    
    if (!fileData || fileData.length < 100) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid file data' 
      }, { status: 400 });
    }
    
    // 4. DATABASE OPERATIONS
    const client = await pool.connect();
    
    try {
      console.log('🔍 Verifying order', orderId, 'for user', userId);
      
      // Check if order exists and belongs to user
      const orderResult = await client.query(
        `SELECT o.id, o.order_number, o.user_id, o.status, o.total_amount
         FROM orders o
         WHERE o.id = $1 AND o.user_id = $2`,
        [orderId, userId]
      );
      
      if (orderResult.rows.length === 0) {
        // Order doesn't exist or doesn't belong to user
        const anyOrderResult = await client.query(
          'SELECT order_number FROM orders WHERE id = $1',
          [orderId]
        );
        
        if (anyOrderResult.rows.length === 0) {
          console.log('🔴 Order', orderId, 'does not exist');
          return NextResponse.json({ 
            success: false,
            error: `Order #${orderId} not found. Please check your order number.`
          }, { status: 404 });
        } else {
          console.log('🔴 Order exists but belongs to different user');
          return NextResponse.json({ 
            success: false,
            error: 'This order does not belong to your account.'
          }, { status: 403 });
        }
      }
      
      const order = orderResult.rows[0];
      console.log('🟢 Order verified:', order.order_number, 'Status:', order.status);
      
      // Check order status
      if (order.status !== 'pending' && order.status !== 'payment_pending') {
        return NextResponse.json({ 
          success: false,
          error: `Order #${order.order_number} is already ${order.status}. Cannot upload new proof.`
        }, { status: 400 });
      }
      
      // 5. UPLOAD TO CLOUDINARY (if configured)
      let finalFileUrl = fileData;
      let cloudinaryPublicId: string | null = null;
      
      if (process.env.CLOUDINARY_CLOUD_NAME && 
          process.env.CLOUDINARY_API_KEY && 
          process.env.CLOUDINARY_API_SECRET) {
        
        try {
          console.log('☁️ Uploading to Cloudinary...');
          
          // Convert base64 to buffer for Cloudinary
          const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          const cloudinaryResult = await uploadToCloudinary(
            buffer,
            `hair-stop/orders/${order.order_number}`
          );
          
          finalFileUrl = cloudinaryResult.secure_url;
          cloudinaryPublicId = cloudinaryResult.public_id;
          
          console.log('✅ Uploaded to Cloudinary:', cloudinaryResult.secure_url);
          
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary upload failed:', cloudinaryError);
          // Continue with base64 storage
        }
      } else {
        console.log('ℹ️ Cloudinary not configured, using base64 storage');
      }
      
      // 6. UPDATE ORDER WITH PROOF
      console.log('💾 Updating order in database...');
      
      // Start transaction
      await client.query('BEGIN');
      
      try {
        // Update order with proof
        await client.query(
          `UPDATE orders 
           SET proof_of_payment_url = $1, 
               status = 'payment_pending', 
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [finalFileUrl, orderId]
        );
        
        // Record in uploaded_files table
        await client.query(
          `INSERT INTO uploaded_files 
           (order_id, file_name, file_type, file_size, file_url, public_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId,
            fileName,
            fileType,
            fileSize,
            finalFileUrl,
            cloudinaryPublicId
          ]
        );
        
        // Create payment session record
        const sessionId = `pay_${orderId}_${Date.now()}`;
        await client.query(
          `INSERT INTO payment_sessions (order_id, user_id, session_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (order_id) DO UPDATE 
           SET session_id = $3, updated_at = CURRENT_TIMESTAMP`,
          [orderId, userId, sessionId]
        );
        
        await client.query('COMMIT');
        console.log('✅ Transaction committed successfully');
        
      } catch (transactionError) {
        await client.query('ROLLBACK');
        console.error('❌ Transaction failed:', transactionError);
        throw transactionError;
      }
      
      // 7. RETURN SUCCESS RESPONSE
      return NextResponse.json({ 
        success: true, 
        fileUrl: finalFileUrl,
        fileName,
        fileSize,
        fileType,
        orderNumber: order.order_number,
        orderId,
        totalAmount: order.total_amount,
        message: 'Payment proof uploaded successfully! Our team will verify it within 1-2 business days.',
        storedIn: cloudinaryPublicId ? 'cloudinary' : 'database',
        timestamp: new Date().toISOString()
      });
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Database error while saving proof',
        details: dbError instanceof Error ? dbError.message : 'Unknown'
      }, { status: 500 });
    } finally {
      client.release();
      console.log('🔌 Database connection released');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check and order verification endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');
  
  if (!orderId) {
    return NextResponse.json({
      success: true,
      message: 'Upload proof API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        POST: 'Upload payment proof',
        GET: 'Check order status (?orderId=123)'
      }
    });
  }
  
  try {
    const parsedOrderId = parseInt(orderId);
    
    if (isNaN(parsedOrderId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Order ID format'
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          o.id, 
          o.order_number, 
          o.user_id, 
          o.status, 
          o.total_amount,
          o.proof_of_payment_url,
          o.created_at,
          COUNT(oi.id) as item_count
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = $1
         GROUP BY o.id`,
        [parsedOrderId]
      );
      
      return NextResponse.json({
        success: true,
        orderExists: result.rows.length > 0,
        order: result.rows[0] || null,
        message: result.rows.length > 0 
          ? `Order #${result.rows[0].order_number} found` 
          : `Order #${orderId} not found`
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}