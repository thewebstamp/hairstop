// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Find user with valid verification token
      const result = await client.query(
        `SELECT id, email_verified FROM users 
         WHERE verification_token = $1 
         AND verification_expires > NOW()`,
        [token]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired verification token' },
          { status: 400 }
        );
      }

      const user = result.rows[0];

      // Check if already verified
      if (user.email_verified) {
        return NextResponse.json({
          success: true,
          message: 'Email already verified'
        });
      }

      // Mark email as verified
      await client.query(
        `UPDATE users 
         SET email_verified = CURRENT_TIMESTAMP, 
             verification_token = NULL,
             verification_expires = NULL
         WHERE id = $1`,
        [user.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! You can now login.'
      });
    } finally {
      client.release();
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email', details: error.message },
      { status: 500 }
    );
  }
}