// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Find user by valid reset token
      const userResult = await client.query(
        `SELECT id FROM users 
         WHERE reset_token = $1 AND reset_token_expires > NOW()`,
        [token]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      const userId = userResult.rows[0].id;

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      await client.query(
        `UPDATE users 
         SET password_hash = $1, 
             reset_token = NULL, 
             reset_token_expires = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [hashedPassword, userId]
      );

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      });
    } finally {
      client.release();
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Verify token is valid
      const userResult = await client.query(
        `SELECT id FROM users 
         WHERE reset_token = $1 AND reset_token_expires > NOW()`,
        [token]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        valid: true,
        message: 'Token is valid'
      });
    } finally {
      client.release();
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to verify token', details: error.message },
      { status: 500 }
    );
  }
}