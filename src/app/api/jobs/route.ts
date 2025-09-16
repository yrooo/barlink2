import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { JobService } from '@/lib/services/jobService';

export async function GET() {
  try {
    const jobs = await JobService.getActiveJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

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
      .select('role, company')
      .eq('id', user.id)
      .single();
    
    if (!userProfile || userProfile.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { error: 'Unauthorized. Only employers can create jobs.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const { title, description, location, salary, customQuestions } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const job = await JobService.createJob({
      title,
      company: userProfile.company,
      description,
      location,
      salary,
      employer_id: user.id,
      status: 'active'
    }, customQuestions || []);

    if (!job) {
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

