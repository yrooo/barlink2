import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// import { Interview } from '@/types';
import { createCalendarEvent } from '@/lib/googleCalendar';
import InterviewModel from '@/lib/models/Interview';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      applicationId,
      candidateName,
      position,
      date,
      time,
      type,
      location,
      notes
    } = body;

    // Validate required fields
    if (!applicationId || !candidateName || !position || !date || !time || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const interviewDate = new Date(`${date}T${time}`);
    if (interviewDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Interview date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate location/meeting link based on type
    if (!location) {
      return NextResponse.json(
        { success: false, error: type === 'online' ? 'Meeting link is required' : 'Location is required' },
        { status: 400 }
      );
    }

    if (type === 'online') {
      const urlPattern = /^(https?:\/\/)?(www\.)?(zoom\.us|meet\.google\.com|teams\.microsoft\.com)/i;
      if (!urlPattern.test(location)) {
        return NextResponse.json(
          { success: false, error: 'Invalid meeting link format' },
          { status: 400 }
        );
      }
    }

    await dbConnect();
    const db = mongoose.connection.db;

    // Verify the application exists and belongs to the current employer
    const application = await db!.collection('applications').findOne({
      _id: new mongoose.Types.ObjectId(applicationId),
      status: 'accepted' // Only allow scheduling for accepted applications
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found or not accepted' },
        { status: 404 }
      );
    }

    // Get the job to verify employer ownership
    const job = await db!.collection('jobs').findOne({
      _id: new mongoose.Types.ObjectId(application.jobId),
      employerId: new mongoose.Types.ObjectId(session.user.id)
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to schedule interview for this application' },
        { status: 403 }
      );
    }

    // Check if interview already exists for this application
    const existingInterview = await db!.collection('interviews').findOne({
      applicationId: new mongoose.Types.ObjectId(applicationId)
    });

    if (existingInterview) {
      return NextResponse.json(
        { success: false, error: 'Interview already scheduled for this application' },
        { status: 409 }
      );
    }

    // Get applicant details for calendar event
    const applicant = await db!.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(application.applicantId)
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: 'Applicant not found' },
        { status: 404 }
      );
    }

    // Create interview date-time
    const interviewDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(interviewDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    // Create Google Calendar event
    let googleCalendarEventId = null;
    let meetingLinkFromCalendar = null;

    try {
      const calendarResult = await createCalendarEvent({
        summary: `Interview: ${position} - ${candidateName}`,
        description: `Interview for ${position} position at ${job.companyName || 'Company'}\n\nNotes: ${notes || 'No additional notes'}`,
        startDateTime: interviewDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        attendeeEmails: [applicant.email, session.user.email],
        location: type === 'offline' ? location : undefined,
        meetingLink: type === 'online' ? location : undefined,
      });

      if (calendarResult.success) {
        googleCalendarEventId = calendarResult.eventId;
        if (type === 'online' && calendarResult.meetingLink) {
          meetingLinkFromCalendar = calendarResult.meetingLink;
        }
      } else {
        console.error('Failed to create Google Calendar event:', calendarResult.error);
      }
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      // Continue without Google Calendar integration
    }

    // Create interview object using Mongoose model
    const interviewData = {
      applicationId: new ObjectId(applicationId),
      jobId: new ObjectId(application.jobId),
      employerId: new mongoose.Types.ObjectId(session.user.id),
      applicantId: new ObjectId(application.applicantId),
      scheduledDate: interviewDateTime,
      scheduledTime: time,
      interviewType: type,
      ...(type === 'online' ? { 
        meetingLink: meetingLinkFromCalendar || location 
      } : { location }),
      notes: notes || '',
      status: 'scheduled',
      googleCalendarEventId,
    };

    // Save interview to database using Mongoose
    const interview = new InterviewModel(interviewData);
    const savedInterview = await interview.save();

    // Update application status to indicate interview is scheduled
    await db!.collection('applications').updateOne( 
      { _id: new mongoose.Types.ObjectId(applicationId) },
      { 
        $set: { 
          interviewScheduled: true,
          updatedAt: new Date().toISOString()
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: savedInterview.toObject(),
      message: googleCalendarEventId ? 
        'Interview scheduled successfully with Google Calendar event created' : 
        'Interview scheduled successfully (Google Calendar integration unavailable)'
    });

  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    await dbConnect();
    const db = mongoose.connection.db;

    let query = {};
    if (applicationId) {
      query = { applicationId: new ObjectId(applicationId) };
    }

    // Get interviews for jobs owned by the current employer
    const interviews = await db!.collection('interviews').aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationId',
          foreignField: '_id',
          as: 'application'
        }
      },
      { $unwind: '$application' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'application.jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $match: {
          'job.employerId': new mongoose.Types.ObjectId(session.user.id)
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: interviews
    });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}