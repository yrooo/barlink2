import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Job from '@/lib/models/Job';

export async function GET() {
  try {
    await dbConnect();
    const jobs = await Job.find({ status: 'active' })
      .populate('employerId', 'name company')
      .sort({ createdAt: -1 });
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
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { error: 'Unauthorized. Only employers can create jobs.' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    
    const { title, description, location, salary, customQuestions, syarat } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const job = new Job({
      title,
      company: session.user.company,
      description,
      location,
      salary,
      employerId: session.user.id,
      customQuestions: customQuestions || [],
      syarat: syarat || [],
    });

    await job.save();
    
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

