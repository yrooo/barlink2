import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-auth';
import { getWhatsAppService } from '@/lib/whatsappService';

export async function GET() {
  try {
    // Check authentication (only admin should access this)
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    // Check if user is admin
    const emailMatch = user.email === process.env.ADMIN_EMAIL;
    const roleMatch = profile.role === 'admin';
    const isAdmin = emailMatch || roleMatch;
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get WhatsApp service instance
    const whatsappService = getWhatsAppService();

    const isReady = whatsappService.isClientReady();
    const qrCode = whatsappService.getQRCode();

    return NextResponse.json({
      success: true,
      data: {
        isReady,
        qrCode: isReady ? null : qrCode, // Only return QR code if not ready
        message: isReady 
          ? 'WhatsApp service is ready' 
          : 'WhatsApp service is not ready. Please scan the QR code to authenticate.'
      }
    });
  } catch (error) {
    console.error('Error in WhatsApp status API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}