import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getWhatsAppService } from '@/lib/whatsappService';

export async function GET() {
  try {
    // Check authentication (only admin should access this)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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