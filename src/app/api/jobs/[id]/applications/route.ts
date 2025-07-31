import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Job from '@/lib/models/Job';

export async function GET(
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
    
    const applications = await Application.find({ jobId: id })
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

