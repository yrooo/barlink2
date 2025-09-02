import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Job from '@/lib/models/Job';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Verify job belongs to the employer
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const job = await Job.findOne({ 
      _id: id, 
      employerId: session.user.id 
    });
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Toggle status between active and inactive
    const newStatus = job.status === 'active' ? 'inactive' : 'active';
    
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );
    
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error toggling job status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle job status' },
      { status: 500 }
    );
  }
}