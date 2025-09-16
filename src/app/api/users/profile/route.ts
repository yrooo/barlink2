import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { UserService } from '@/lib/services/userService';
import { formatPhoneNumber } from '@/lib/utils';

interface UpdateData {
  name: string;
  company?: string;
  description?: string;
  website?: string;
  location?: string;
  whatsappNumber?: string;
  phone?: string;
  bio?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

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
    };

    // Add role-specific fields
    if (userProfile?.role === 'pencari_kandidat') {
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
      updateData.whatsappNumber = whatsappNumber ? formatPhoneNumber(whatsappNumber) : whatsappNumber;
    } else {
      // For job seekers, update profile fields
      updateData.phone = phone ? formatPhoneNumber(phone) : phone;
      updateData.whatsappNumber = whatsappNumber ? formatPhoneNumber(whatsappNumber) : whatsappNumber;
      updateData.bio = description;
      updateData.website = website;
      updateData.location = location;
    }

    const updatedUser = await UserService.updateUser(user.id, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        company: updatedUser.company,
        description: updatedUser.description,
        website: updatedUser.website,
        location: updatedUser.location,
        phone: updatedUser.phone,
        whatsapp_number: updatedUser.whatsapp_number,
        whatsapp_verified: updatedUser.whatsapp_verified,
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
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userProfile = await UserService.getUserById(user.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

