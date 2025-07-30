import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Job from '@/lib/models/Job'; // Ensure Job model is imported to populate jobDetails
import User from '@/lib/models/User'; // Ensure User model is imported for applicantId population if needed elsewhere

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Forbidden: Only job seekers can view their applications.' },
        { status: 403 }
      );
    }

    await dbConnect();

    const applications = await Application.find({ applicantId: session.user.id })
      .populate({
        path: 'jobId',
        select: 'title company location salary createdAt', // Select fields you want to show from Job
        model: Job, // Explicitly providing model here
      })
      .populate({
        path: 'employerId',
        select: 'name company', // Select fields from the employer/company if needed
        model: User, // Explicitly providing model here
      })
      .sort({ createdAt: -1 }); // Sort by most recent applications

    if (!applications) {
      return NextResponse.json({ error: 'No applications found' }, { status: 404 });
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
