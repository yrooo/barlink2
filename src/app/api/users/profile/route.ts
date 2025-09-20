import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createServerSupabaseClient } from '@/lib/supabase-auth';
import { formatPhoneNumber } from '@/lib/utils';



export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile } = authResult;
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    
    const { name, company, description, website, location, phone, whatsappNumber } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Prepare update object based on user role
    const updateData: Record<string, string | Date> = {
      name,
      updated_at: new Date().toISOString(),
    };

    // Add role-specific fields
    if (profile.role === 'pencari_kandidat') {
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
      updateData.whatsapp_number = whatsappNumber ? formatPhoneNumber(whatsappNumber) : whatsappNumber;
    } else {
      // For job seekers, update profile fields
      updateData.phone = phone ? formatPhoneNumber(phone) : phone;
      updateData.whatsapp_number = whatsappNumber ? formatPhoneNumber(whatsappNumber) : whatsappNumber;
      updateData.description = description;
      updateData.website = website;
      updateData.location = location;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedProfile
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
    const authResult = await requireAuth();
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { profile } = authResult;
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

