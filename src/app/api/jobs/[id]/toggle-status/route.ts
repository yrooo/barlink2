import { NextRequest, NextResponse } from 'next/server';
import { requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';

export async function PATCH(
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
    
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('id', id)
      .eq('employer_id', user.id)
      .single();
    
    if (fetchError || !job) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Toggle status between active and inactive
    const newStatus = job.status === 'active' ? 'inactive' : 'active';
    
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error toggling job status:', updateError);
      return NextResponse.json(
        { error: 'Failed to toggle job status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error toggling job status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle job status' },
      { status: 500 }
    );
  }
}