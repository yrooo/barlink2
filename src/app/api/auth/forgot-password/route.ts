import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import EmailService from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { success: true, message: 'If the email exists, a reset link has been sent' },
        { status: 200 }
      );
    }

    // Note: In a production app, you should store reset tokens in a separate table
    // For now, we'll send the email directly as a simplified implementation
    // TODO: Implement proper reset token storage and validation
    
    // Send reset email with email as token (simplified)
    const emailSent = await EmailService.sendPasswordResetEmail(email, email);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'If the email exists, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}