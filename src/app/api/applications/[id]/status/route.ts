import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Application from '@/lib/models/Application';
// import Job from '@/lib/models/Job';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = (await context.params);
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { error: 'Forbidden - Only employers can update application status' },
        { status: 403 }
      );
    }

    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await dbConnect();




    // Find the application and populate job data to verify ownership
    const application = await Application.findById(applicationId).populate('jobId');
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify that the job belongs to the current user
    if (application.jobId.employerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update applications for your own jobs' },
        { status: 403 }
      );
    }

    // Update the application status
    application.status = status;
    application.updatedAt = new Date();

    await application.save();

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}