import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { uploadCV, deleteCV } from '@/lib/supabase';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

// POST - Upload CV
export async function POST(request: NextRequest) {
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

    // Only job seekers can upload CVs
    if (!userProfile || userProfile.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Only job seekers can upload CVs' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get current user
    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete old CV if exists
    if (userDoc.profile?.cvPath) {
      await deleteCV(userDoc.profile.cvPath);
    }

    // Upload new CV
    const uploadResult = await uploadCV(file, user.id);
    if (!uploadResult) {
      return NextResponse.json(
        { error: 'Failed to upload CV' },
        { status: 500 }
      );
    }

    // Update user profile with CV information
    userDoc.profile = {
      ...userDoc.profile,
      cvUrl: uploadResult.url,
      cvPath: uploadResult.path,
      cvFileName: file.name,
      cvUploadedAt: new Date(),
    };

    await userDoc.save();

    return NextResponse.json({
      message: 'CV uploaded successfully',
      cvUrl: uploadResult.url,
      fileName: file.name,
    });

  } catch (error) {
    console.error('Error uploading CV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete CV
export async function DELETE() {
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

    if (!userProfile || userProfile.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Only job seekers can delete CVs' },
        { status: 403 }
      );
    }

    await dbConnect();

    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!userDoc.profile?.cvPath) {
      return NextResponse.json(
        { error: 'No CV found to delete' },
        { status: 404 }
      );
    }

    // Delete from Supabase
    const deleted = await deleteCV(userDoc.profile.cvPath);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete CV from storage' },
        { status: 500 }
      );
    }

    // Remove CV info from user profile
    userDoc.profile.cvUrl = undefined;
    userDoc.profile.cvPath = undefined;
    userDoc.profile.cvFileName = undefined;
    userDoc.profile.cvUploadedAt = undefined;

    await userDoc.save();

    return NextResponse.json({
      message: 'CV deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}