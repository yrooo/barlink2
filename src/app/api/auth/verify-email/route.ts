import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Verification token is missing.' }, { status: 400 });
    }

    // Note: Verification tokens should be stored in a separate table or Redis
    // For now, we'll implement a simplified version
    // TODO: Implement proper verification token storage
    
    // For simplified implementation, we'll assume token is the user's email
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified')
      .eq('email', token) // Simplified: using email as token
      .single();

    if (findError || !user) {
      return NextResponse.json({ error: 'Invalid verification token.' }, { status: 400 });
    }

    // Update user email verification status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ email_verified: true })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email verified successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}