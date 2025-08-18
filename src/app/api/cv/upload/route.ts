import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { uploadCV, getViewableCVUrl } from '@/lib/cloudinary';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

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
        { error: 'No CV file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadCV(buffer, file.name, session.user.id);

    // Connect to database and update user profile
    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete old CV from Cloudinary if exists
    if (user.profile?.cv?.publicId) {
      try {
        const { deleteCV } = await import('@/lib/cloudinary');
        await deleteCV(user.profile.cv.publicId);
      } catch (error) {
        console.error('Error deleting old CV:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Update user profile with new CV info
    if (!user.profile) {
      user.profile = {};
    }
    
    user.profile.cv = {
      publicId: uploadResult.public_id,
      url: getViewableCVUrl(uploadResult.public_id),
      fileName: file.name,
      uploadedAt: new Date(),
    };
    
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      message: 'CV uploaded successfully',
      cv: {
        publicId: uploadResult.public_id,
        url: getViewableCVUrl(uploadResult.public_id),
        fileName: file.name,
        uploadedAt: user.profile.cv.uploadedAt,
      },
    });

  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}