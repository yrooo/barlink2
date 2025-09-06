import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';

export async function GET() {
  try {
    // In production, require authentication and admin access
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check if user is admin (either by email or role)
      const isAdmin = session.user?.email === process.env.ADMIN_EMAIL || 
      (session.user?.role as string) === 'admin';
      
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
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