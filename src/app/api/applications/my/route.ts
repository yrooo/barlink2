import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ApplicationService } from '@/lib/services/applicationService';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Forbidden: Only job seekers can view their applications.' },
        { status: 403 }
      );
    }

    const applications = await ApplicationService.getApplicationsByApplicant(user.id);
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
