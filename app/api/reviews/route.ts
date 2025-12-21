// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addReview, getProductReviews } from '@/lib/data';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { productId, userName, userEmail, rating, comment } = body;

    // Validate input
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: 'Review must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check if user is logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to submit a review' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Check if user has purchased the product
    const client = await pool.connect();
    try {
      const purchaseCheck = await client.query(
        `SELECT 1 FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'completed'`,
        [userId, productId]
      );

      if (purchaseCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'You must purchase this product before reviewing it' },
          { status: 403 }
        );
      }

      // Check if user has already reviewed this product
      const existingReview = await client.query(
        `SELECT 1 FROM reviews WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );

      if (existingReview.rows.length > 0) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    } finally {
      client.release();
    }

    // Fix: Convert null/undefined email to undefined
    const userEmailToUse = session.user.email || userEmail || undefined;
    const userNameToUse = session.user.name || userName || 'Anonymous';

    // Add review to database
    const review = await addReview({
      productId,
      userId,
      userName: userNameToUse,
      userEmail: userEmailToUse,
      rating,
      comment,
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully'
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const reviews = await getProductReviews(parseInt(productId));
    return NextResponse.json(reviews);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
}