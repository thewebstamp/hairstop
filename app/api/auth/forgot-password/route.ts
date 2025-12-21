// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Find user by email
      const userResult = await client.query(
        'SELECT id, name, email FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        // Don't reveal that user doesn't exist for security
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, you will receive reset instructions.'
        });
      }

      const user = userResult.rows[0];

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      // Save reset token to database
      await client.query(
        `UPDATE users 
         SET reset_token = $1, reset_token_expires = $2
         WHERE id = $3`,
        [resetToken, resetTokenExpires, user.id]
      );

      // Send reset email
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetToken,
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      });
    } finally {
      client.release();
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}