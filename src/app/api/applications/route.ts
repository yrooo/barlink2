import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole('pelamar_kerja');
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    
    const { jobId, answers } = body;
    
    if (!jobId || !answers) {
      return NextResponse.json(
        { error: 'Job ID and answers are required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, employer_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user already applied
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        applicant_id: user.id,
        employer_id: job.employer_id,
        answers,
        status: 'pending'
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Update job applications count
    await supabase.rpc('increment_applications_count', { job_id: jobId });
    
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
    const authResult = await requireAuth();
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile } = authResult;
    const supabase = await createServerSupabaseClient();
    
    let applications;
    
    if (profile.role === 'pencari_kandidat') {
      // Employer: get applications for their jobs
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner(title),
          users!applications_applicant_id_fkey(name, email)
        `)
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });
      
      applications = data;
      if (error) throw error;
    } else {
      // Job seeker: get their applications
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner(title, company)
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });
      
      applications = data;
      if (error) throw error;
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

