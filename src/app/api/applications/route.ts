import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ApplicationService } from '@/lib/services/applicationService';
import { JobService } from '@/lib/services/jobService';

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
    
    if (!userProfile || userProfile.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Unauthorized. Only job seekers can apply.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const { jobId, answers } = body;
    
    if (!jobId || !answers) {
      return NextResponse.json(
        { error: 'Job ID and answers are required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await JobService.getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user already applied
    const hasApplied = await ApplicationService.hasUserApplied(jobId, user.id);
    if (hasApplied) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Prepare answers for Supabase format
    const formattedAnswers = answers.map((answer: { questionId: string; answer: string | string[] }) => ({
      questionId: answer.questionId,
      answer: answer.answer
    }));

    const application = await ApplicationService.createApplication(
      {
        job_id: jobId,
        applicant_id: user.id,
        employer_id: job.employer_id,
        status: 'pending'
      },
      formattedAnswers
    );

    if (!application) {
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
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

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let applications;
    
    if (userProfile?.role === 'pencari_kandidat') {
      // Employer: get applications for their jobs
      applications = await ApplicationService.getApplicationsByEmployer(user.id);
    } else {
      // Job seeker: get their applications
      applications = await ApplicationService.getApplicationsByApplicant(user.id);
    }
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

