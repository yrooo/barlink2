import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { uploadCV, deleteCV } from '@/lib/supabase';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

// POST - Upload CV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only job seekers can upload CVs
    if (session.user.role !== 'pelamar_kerja') {
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
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete old CV if exists
    if (user.profile?.cvPath) {
      await deleteCV(user.profile.cvPath);
    }

    // Upload new CV
    const uploadResult = await uploadCV(file, session.user.id);
    if (!uploadResult) {
      return NextResponse.json(
        { error: 'Failed to upload CV' },
        { status: 500 }
      );
    }

    // Update user profile with CV information
    user.profile = {
      ...user.profile,
      cvUrl: uploadResult.url,
      cvPath: uploadResult.path,
      cvFileName: file.name,
      cvUploadedAt: new Date(),
    };

    await user.save();

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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Only job seekers can delete CVs' },
        { status: 403 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.profile?.cvPath) {
      return NextResponse.json(
        { error: 'No CV found to delete' },
        { status: 404 }
      );
    }

    // Delete from Supabase
    const deleted = await deleteCV(user.profile.cvPath);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete CV from storage' },
        { status: 500 }
      );
    }

    // Remove CV info from user profile
    user.profile.cvUrl = undefined;
    user.profile.cvPath = undefined;
    user.profile.cvFileName = undefined;
    user.profile.cvUploadedAt = undefined;

    await user.save();

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