import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Job from '@/lib/models/Job';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'pelamar_kerja') {
      return NextResponse.json(
        { error: 'Unauthorized. Only job seekers can apply.' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Check if user has uploaded CV
    const user = await User.findById(session.user.id);
    if (!user || !user.profile?.cvUrl) {
      return NextResponse.json(
        { error: 'CV_REQUIRED', message: 'Tambahkan CV anda sebelum lamar pekerjaan' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    const { jobId, answers } = body;
    
    if (!jobId || !answers) {
      return NextResponse.json(
        { error: 'Job ID and answers are required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: session.user.id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    const application = new Application({
      jobId,
      applicantId: session.user.id,
      employerId: job.employerId,
      answers,
    });

    await application.save();

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });
    
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    let applications;
    
    if (session.user.role === 'pencari_kandidat') {
      // Employer: get applications for their jobs
      applications = await Application.find({ employerId: session.user.id })
        .populate('jobId', 'title')
        .populate('applicantId', 'name email profile')
        .sort({ createdAt: -1 });
    } else {
      // Job seeker: get their applications
      applications = await Application.find({ applicantId: session.user.id })
        .populate('jobId', 'title company')
        .sort({ createdAt: -1 });
    }
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

