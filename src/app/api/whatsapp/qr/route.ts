import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';

export async function GET() {
  try {
    // In production, require authentication and admin access
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions);
      
      // Debug logging
      console.log('=== QR Route Debug Info ===');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('Session exists:', !!session);
      console.log('Session user:', session?.user);
      console.log('ADMIN_EMAIL from env:', process.env.ADMIN_EMAIL);
      console.log('User email:', session?.user?.email);
      console.log('User role:', session?.user?.role);
      
      if (!session) {
        console.log('❌ No session found');
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check if user is admin (either by email or role)
      const emailMatch = session.user?.email === process.env.ADMIN_EMAIL;
      const roleMatch = (session.user?.role as string) === 'admin';
      const isAdmin = emailMatch || roleMatch;
      
      console.log('Email match:', emailMatch);
      console.log('Role match:', roleMatch);
      console.log('Is admin:', isAdmin);
      
      if (!isAdmin) {
        console.log('❌ Admin access denied');
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
      
      console.log('✅ Admin access granted');
    }

    // Proxy request to VPS WhatsApp service
    const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/qr`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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