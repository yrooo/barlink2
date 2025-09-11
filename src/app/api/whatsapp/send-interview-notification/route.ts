import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only companies/admin can send notifications
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (by email) or company
    const isAdmin = session.user?.email === process.env.ADMIN_EMAIL;
    const isCompany = session.user.role === 'pencari_kandidat';
    
    if (!isAdmin && !isCompany) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      phoneNumber, 
      applicantName, 
      jobTitle, 
      companyName, 
      interviewDate, 
      interviewTime, 
      interviewType, 
      location, 
      meetingLink, 
      notes 
    } = body;

    // Validate required fields
    if (!phoneNumber || !applicantName || !jobTitle || !companyName || !interviewDate || !interviewTime || !interviewType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phoneNumber, applicantName, jobTitle, companyName, interviewDate, interviewTime, interviewType' },
        { status: 400 }
      );
    }

    // Validate interview type
    if (!['online', 'offline'].includes(interviewType)) {
      return NextResponse.json(
        { success: false, error: 'Interview type must be either "online" or "offline"' },
        { status: 400 }
      );
    }

    // Validate conditional fields
    if (interviewType === 'online' && !meetingLink) {
      return NextResponse.json(
        { success: false, error: 'Meeting link is required for online interviews' },
        { status: 400 }
      );
    }

    if (interviewType === 'offline' && !location) {
      return NextResponse.json(
        { success: false, error: 'Location is required for offline interviews' },
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

    const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/send-interview-notification`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phoneNumber,
        applicantName,
        jobTitle,
        companyName,
        interviewDate,
        interviewTime,
        interviewType,
        location,
        meetingLink,
        notes
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send WhatsApp notification' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in send-interview-notification API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}