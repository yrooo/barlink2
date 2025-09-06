import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const VPS_API_KEY = process.env.VPS_API_KEY;

export async function POST(request: NextRequest) {
  try {
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
    if (VPS_API_KEY) {
      headers['X-API-Key'] = VPS_API_KEY;
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