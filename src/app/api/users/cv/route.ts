import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { uploadCV, deleteCV, supabaseAdmin } from '@/lib/supabase';

// POST - Upload CV
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('role, cv_url, cv_path, cv_filename')
      .eq('id', user.id)
      .single();

    // Only job seekers can upload CVs
    if (!userProfile || userProfile.role !== 'seeker') {
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

    // Delete old CV if exists
    if (userProfile.cv_path) {
      await deleteCV(userProfile.cv_path);
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
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        cv_url: uploadResult.url,
        cv_path: uploadResult.path,
        cv_filename: file.name,
        cv_uploaded_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
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
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role and CV info
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('role, cv_path')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'seeker') {
      return NextResponse.json(
        { error: 'Only job seekers can delete CVs' },
        { status: 403 }
      );
    }

    if (!userProfile.cv_path) {
      return NextResponse.json(
        { error: 'No CV found to delete' },
        { status: 404 }
      );
    }

    // Delete from Supabase storage
    const deleted = await deleteCV(userProfile.cv_path);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete CV from storage' },
        { status: 500 }
      );
    }

    // Remove CV info from user profile
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        cv_url: null,
        cv_path: null,
        cv_filename: null,
        cv_uploaded_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
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