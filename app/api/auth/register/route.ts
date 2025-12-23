// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email'; // We'll update this function

export async function POST(request: NextRequest) {
  console.log('=== REGISTRATION STARTED ===');
  
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    console.log('Registration data:', { name, email, phone });

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
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
      // Check if user already exists
      console.log('Checking for existing user...');
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        console.log('User already exists');
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user - set email_verified to current timestamp immediately
      console.log('Creating user in database...');
      const result = await client.query(
        `INSERT INTO users 
         (name, email, password_hash, phone, email_verified, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, role, email_verified`,
        [name, email.toLowerCase(), hashedPassword, phone || null]
      );

      const user = result.rows[0];
      console.log('User created:', user);

      // Send welcome email WITHOUT verification requirement
      console.log('Attempting to send welcome email...');
      try {
        // Use the updated sendWelcomeEmail function (without verification token)
        const emailResult = await sendWelcomeEmail({
          to: email,
          name: name,
        });
        console.log('Welcome email send result:', emailResult);
      } catch (emailError) {
        console.error('Welcome email sending failed:', emailError);
        // Don't fail registration if email sending fails
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          email_verified: user.email_verified
        },
        message: 'Registration successful! You can now login to your account.'
      });
    } finally {
      client.release();
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}