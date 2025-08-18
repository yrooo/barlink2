import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { deleteCV } from '@/lib/cloudinary';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only job seekers can delete their CVs
    if (session.user.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Only job seekers can delete CVs' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a CV
    if (!user.profile?.cv?.publicId) {
      return NextResponse.json(
        { error: 'No CV found to delete' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    try {
      await deleteCV(user.profile.cv.publicId);
    } catch (error) {
      console.error('Error deleting CV from Cloudinary:', error);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Remove CV info from user profile
    user.profile.cv = undefined;
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      message: 'CV deleted successfully',
    });

  } catch (error) {
    console.error('CV deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}