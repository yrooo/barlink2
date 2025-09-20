import { NextRequest, NextResponse } from 'next/server';
import { requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        users!jobs_employer_id_fkey(name, company)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }
    
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
    const authResult = await requireRole('pencari_kandidat');
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile } = authResult;
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    
    const { title, description, location, salary, customQuestions } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        title,
        company: profile.company,
        description,
        location,
        salary,
        employer_id: user.id,
        custom_questions: customQuestions || [],
        status: 'active',
        applications_count: 0
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
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

