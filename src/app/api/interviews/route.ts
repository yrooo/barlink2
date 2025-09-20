import { NextRequest, NextResponse } from 'next/server';
import { requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';
import { EmailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole('pencari_kandidat');
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile } = authResult;

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

    const supabase = await createServerSupabaseClient();

    // Verify the application exists and belongs to the current employer
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!applications_job_id_fkey(id, employer_id),
        applicant:users!applications_applicant_id_fkey(id, name, email, whatsapp_number, whatsapp_verified)
      `)
      .eq('id', applicationId)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found or not accepted' },
        { status: 404 }
      );
    }

    // Verify employer ownership
    if (application.job.employer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to schedule interview for this application' },
        { status: 403 }
      );
    }

    // Check if interview already exists for this application
    const { data: existingInterview } = await supabase
      .from('interviews')
      .select('id')
      .eq('application_id', applicationId)
      .single();

    if (existingInterview) {
      return NextResponse.json(
        { success: false, error: 'Interview already scheduled for this application' },
        { status: 409 }
      );
    }

    const applicant = application.applicant;



    // Create interview date-time
    const interviewDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(interviewDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    // Send email notification to applicant
    let emailSent = false;
    
    try {
      const emailService = EmailService.getInstance();
      emailSent = await emailService.sendInterviewScheduleEmail({
        applicantName: candidateName,
        applicantEmail: applicant.email,
        jobTitle: position,
        companyName: profile?.company || 'Company',
        interviewDate: interviewDateTime.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        interviewTime: time,
        interviewType: type,
        location: type === 'offline' ? location : undefined,
        meetingLink: type === 'online' ? location : undefined,
        notes: notes || ''
      });
    } catch (error) {
      console.error('Error sending interview email:', error);
    }

    // Send WhatsApp notification if applicant has verified WhatsApp number
    const appUrl = process.env.APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      if (applicant.whatsapp_number && applicant.whatsapp_verified && appUrl) {
        try {
          const whatsappResponse = await fetch(`${appUrl}/api/whatsapp/send-interview-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            phoneNumber: applicant.whatsapp_number,
            applicantName: candidateName,
            jobTitle: position,
            companyName: profile?.company || 'Company',
            interviewDate: date,
            interviewTime: time,
            interviewType: type,
            location: type === 'offline' ? location : undefined,
            meetingLink: type === 'online' ? location : undefined,
            notes: notes || undefined
          }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (whatsappResponse.ok) {
          console.log(`WhatsApp interview notification sent to ${applicant.whatsapp_number}`);
        } else {
          console.error('Failed to send WhatsApp interview notification:', await whatsappResponse.text());
        }
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp interview notification:', whatsappError);
        // Don't fail the API call if WhatsApp notification fails
      }
    }

    // Create interview object
    const interviewData = {
      application_id: applicationId,
      job_id: application.job_id,
      employer_id: user.id,
      applicant_id: application.applicant_id,
      scheduled_date: interviewDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
      scheduled_time: time,
      interview_type: type,
      ...(type === 'online' ? { 
        meeting_link: location 
      } : { location }),
      notes: notes || '',
      status: 'scheduled',
      email_sent: emailSent
    };

    // Save interview to database
    const { data: savedInterview, error: saveError } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving interview:', saveError);
      return NextResponse.json(
        { success: false, error: 'Failed to save interview' },
        { status: 500 }
      );
    }

    // Update application status to indicate interview is scheduled
    await supabase
      .from('applications')
      .update({ 
        interview_scheduled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    return NextResponse.json({
      success: true,
      data: savedInterview,
      message: emailSent ? 
        'Interview scheduled successfully and email notification sent to applicant' : 
        'Interview scheduled successfully (email notification failed)'
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
    const authResult = await requireRole('pencari_kandidat');
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('interviews')
      .select(`
        *,
        application:applications!interviews_application_id_fkey(*),
        job:jobs!interviews_job_id_fkey(*)
      `)
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    const { data: interviews, error } = await query;

    if (error) {
      console.error('Error fetching interviews:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch interviews' },
        { status: 500 }
      );
    }

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