import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { formatPhoneNumber } from '@/lib/utils';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { otpId, code, phoneNumber, otpCode } = body;

    // Basic validation - ensure we have the required data
    if ((!otpId && !phoneNumber) || (!code && !otpCode)) {
      return NextResponse.json(
        { success: false, error: 'OTP ID/phone number and code are required' },
        { status: 400 }
      );
    }

    // Proxy request to VPS WhatsApp service
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured
    if (WHATSAPP_API_KEY) {
      headers['X-API-Key'] = WHATSAPP_API_KEY;
    }

    const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/verify-otp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'VPS service error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // If OTP verification was successful, update user's database record
    if (data.success && phoneNumber) {
      try {
        await dbConnect();
        
        const updatedUser = await User.findByIdAndUpdate(
          session.user.id,
          {
            whatsappNumber: formatPhoneNumber(phoneNumber),
            whatsappVerified: true,
            whatsappVerifiedAt: new Date()
          },
          { new: true }
        );

        if (!updatedUser) {
          console.error('User not found when updating WhatsApp verification');
        } else {
          console.log(`WhatsApp verification updated for user ${session.user.id}: ${phoneNumber}`);
        }
      } catch (dbError) {
        console.error('Database error when updating WhatsApp verification:', dbError);
        // Don't fail the API call if database update fails, as OTP was verified successfully
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying verify-otp request to VPS:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'WhatsApp service unavailable. Please ensure VPS service is running.' 
      },
      { status: 500 }
    );
  }
}