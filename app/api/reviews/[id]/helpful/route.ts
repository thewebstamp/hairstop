// app/api/reviews/[id]/helpful/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { markReviewHelpful } from '@/lib/data';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting (optional)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // You could store which IPs have voted for which reviews
    // to prevent multiple votes from the same IP

    const newHelpfulCount = await markReviewHelpful(reviewId);

    return NextResponse.json({
      success: true,
      helpful: newHelpfulCount,
      message: 'Review marked as helpful'
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { error: 'Failed to mark review as helpful', details: error.message },
      { status: 500 }
    );
  }
}