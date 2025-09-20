import { NextResponse } from 'next/server';
import { requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';

export async function GET() {
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

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(
          title,
          company,
          location,
          salary,
          created_at
        ),
        users!applications_employer_id_fkey(
          name,
          company
        )
      `)
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ applications: [] });
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
