import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { InterviewService } from '@/lib/services/interviewService';
import { ApplicationService } from '@/lib/services/applicationService';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const { applicationId, scheduledAt, type, notes } = body;
    
    if (!applicationId || !scheduledAt || !type) {
      return NextResponse.json(
        { error: 'Application ID, scheduled time, and type are required' },
        { status: 400 }
      );
    }

    // Verify application exists and belongs to the employer
    const application = await ApplicationService.getApplicationById(applicationId);

    if (!application || application.employer_id !== user.id) {
      return NextResponse.json(
        { error: 'Application not found or unauthorized' },
        { status: 404 }
      );
    }

    const interview = await InterviewService.createInterview({
      application_id: applicationId,
      job_id: application.job_id,
      employer_id: user.id,
      applicant_id: application.applicant_id,
      scheduled_date: new Date(scheduledAt).toISOString().split('T')[0],
      scheduled_time: new Date(scheduledAt).toTimeString().split(' ')[0],
      interview_type: type,
      notes,
      status: 'scheduled'
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Failed to create interview' },
        { status: 500 }
      );
    }

    return NextResponse.json(interview, { status: 201 });

  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
        { success: false, error: 'Unauthorized' },
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let interviews;
    
    if (userProfile.role === 'employer') {
      // Get interviews for jobs posted by this employer
      interviews = await InterviewService.getInterviewsByInterviewer(user.id);
    } else {
      // Get interviews for this candidate
      interviews = await InterviewService.getUpcomingInterviews(user.id, 'applicant');
    }
    
    return NextResponse.json(interviews);

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}