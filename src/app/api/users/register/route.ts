import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import type { UserInsert } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, company } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['pelamar_kerja', 'pencari_kandidat'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if company is provided for pencari_kandidat role
    if (role === 'pencari_kandidat' && !company) {
      return NextResponse.json(
        { error: 'Company name is required for employers' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Create user data
    const userData: UserInsert = {
      name,
      email,
      password: hashedPassword,
      role,
      company: role === 'pencari_kandidat' ? company : undefined,
      email_verified: false,
      whatsapp_verified: false
    };

    // Insert user into Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Send verification email
    const resend = new Resend(process.env.RESEND_API_KEY);

    const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    try {
      console.log('Attempting to send verification email...');
      const { data, error: resendError } = await resend.emails.send({
        from: 'Barlink ID <barlinkid@senze.id>',
        to: email,
        subject: 'Verify your email address',
        html: `<p>Please click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
      });

      if (resendError) {
        console.error('Resend email send error:', resendError);
      } else {
        console.log('Verification email sent successfully:', data);
      }
    } catch (emailError) {
      console.error('General error during email sending process:', emailError);
      // Optionally, handle the error more gracefully, e.g., log it and still create the user
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

