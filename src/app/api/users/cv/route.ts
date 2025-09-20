import { NextRequest, NextResponse } from 'next/server';
import { requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';
import { uploadCV, deleteCV } from '@/lib/supabase';

// POST - Upload CV
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole('pelamar_kerja');
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile } = authResult;
    const supabase = await createServerSupabaseClient();

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

    // Delete old CV if exists
    if (profile.cv_path) {
      await deleteCV(profile.cv_path);
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
    const { error: updateError } = await supabase
      .from('users')
      .update({
        cv_url: uploadResult.url,
        cv_path: uploadResult.path,
        cv_file_name: file.name,
        cv_uploaded_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating profile with CV info:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

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
    const authResult = await requireRole('pelamar_kerja');
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile } = authResult;
    const supabase = await createServerSupabaseClient();

    if (!profile.cv_path) {
      return NextResponse.json(
        { error: 'No CV found to delete' },
        { status: 404 }
      );
    }

    // Delete from Supabase storage
    const deleted = await deleteCV(profile.cv_path);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete CV from storage' },
        { status: 500 }
      );
    }

    // Remove CV info from user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        cv_url: null,
        cv_path: null,
        cv_file_name: null,
        cv_uploaded_at: null,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

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