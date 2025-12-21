// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the admin token cookie if it exists
    response.cookies.delete('admin_token');

    return response;
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}