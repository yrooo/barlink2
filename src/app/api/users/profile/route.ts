import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

interface UpdateData {
  name: string;
  updatedAt: Date;
  company?: string;
  description?: string;
  website?: string;
  location?: string;
  whatsappNumber?: string;
  'profile.phone'?: string;
  'profile.whatsappNumber'?: string;
  'profile.description'?: string;
  'profile.website'?: string;
  'profile.location'?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    
    const { name, company, description, website, location, phone, whatsappNumber } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Prepare update object based on user role
    const updateData: UpdateData = {
      name,
      updatedAt: new Date(),
    };

    // Add role-specific fields
    if (session.user.role === 'pencari_kandidat') {
      if (!company) {
        return NextResponse.json(
          { error: 'Company is required for employers' },
          { status: 400 }
        );
      }
      updateData.company = company;
      updateData.description = description;
      updateData.website = website;
      updateData.location = location;
      updateData.whatsappNumber = whatsappNumber;
    } else {
      // For job seekers, update profile nested object
      updateData['profile.phone'] = phone;
      updateData['profile.whatsappNumber'] = whatsappNumber;
      updateData['profile.description'] = description;
      updateData['profile.website'] = website;
      updateData['profile.location'] = location;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        company: updatedUser.company,
        description: updatedUser.description,
        website: updatedUser.website,
        location: updatedUser.location,
        profile: updatedUser.profile,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

