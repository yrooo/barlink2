import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

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

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Update user's WhatsApp number and verification status in database
    try {
      await connectToDatabase();
      
      const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        {
          whatsappNumber: phoneNumber,
          whatsappVerified: true,
          whatsappVerifiedAt: new Date()
        },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'WhatsApp number updated successfully',
        whatsappNumber: phoneNumber
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to update user information' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in update-user API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}