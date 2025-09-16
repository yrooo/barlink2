import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ApplicationService } from '@/lib/services/applicationService';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = (await context.params);
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

    if (!userProfile || userProfile.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { error: 'Forbidden - Only employers can update application status' },
        { status: 403 }
      );
    }

    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find the application to verify ownership
    const application = await ApplicationService.getApplicationById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify that the job belongs to the current user
    if (application.employer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update applications for your own jobs' },
        { status: 403 }
      );
    }

    // Update the application status
    const updatedApplication = await ApplicationService.updateApplicationStatus(
      applicationId,
      status
    );

    if (!updatedApplication) {
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}