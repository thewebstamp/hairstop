// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Import crypto directly
import pool from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

// Local generateToken function
function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

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
      
      // Generate verification token
      const verificationToken = generateToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      console.log('Token generated:', verificationToken);
      console.log('Expires:', verificationExpires);

      // Create user
      console.log('Creating user in database...');
      const result = await client.query(
        `INSERT INTO users 
         (name, email, password_hash, phone, verification_token, verification_expires, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING id, name, email, role`,
        [name, email.toLowerCase(), hashedPassword, phone || null, verificationToken, verificationExpires]
      );

      const user = result.rows[0];
      console.log('User created:', user);

      // Send welcome email
      console.log('Attempting to send welcome email...');
      console.log('Email settings:', {
        host: process.env.EMAIL_HOST,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
        nodeEnv: process.env.NODE_ENV
      });

      try {
        const emailResult = await sendWelcomeEmail({
          to: email,
          name: name,
          verificationToken,
        });
        console.log('Email send result:', emailResult);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return NextResponse.json({
        success: true,
        user,
        message: 'Registration successful! Please check your email to verify your account.'
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