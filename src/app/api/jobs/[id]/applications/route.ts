import { NextRequest, NextResponse } from 'next/server';
import { requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('pencari_kandidat');
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const supabase = await createServerSupabaseClient();
    
    // Verify job belongs to the employer
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .eq('employer_id', user.id)
      .single();
    
    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }
    
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        *,
        applicant:users!applications_applicant_id_fkey(name, email, profile)
      `)
      .eq('job_id', id)
      .order('created_at', { ascending: false });
    
    if (applicationsError) {
      console.error('Error fetching job applications:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

