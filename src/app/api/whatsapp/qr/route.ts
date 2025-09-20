import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-auth';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

export async function GET() {
  try {
    // In production, require authentication and admin access
    if (process.env.NODE_ENV === 'production') {
      const supabase = await createServerSupabaseClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profile) {
        return NextResponse.json(
          { success: false, error: 'User profile not found' },
          { status: 404 }
        );
      }

      // Check if user is admin (either by email or role)
      const emailMatch = user.email === process.env.ADMIN_EMAIL;
      const roleMatch = profile.role === 'admin';
      const isAdmin = emailMatch || roleMatch;
      
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    // Proxy request to VPS WhatsApp service
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured
    if (WHATSAPP_API_KEY) {
      headers['X-API-Key'] = WHATSAPP_API_KEY;
    }

    const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/qr`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`VPS service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying QR request to VPS:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'WhatsApp service unavailable. Please ensure VPS service is running.' 
      },
      { status: 500 }
    );
  }
}