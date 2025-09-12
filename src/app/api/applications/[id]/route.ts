import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import EmailService from '@/lib/emailService';

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
    
    // Verify application belongs to the employer
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const application = await Application.findOne({
      _id: id,
      employerId: session.user.id
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or unauthorized' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { status, notes } = body;
    
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    ).populate('applicantId', 'name email whatsappNumber whatsappVerified')
     .populate('jobId', 'title company');
    
    // Send email notification for accepted/rejected applications
    if (status === 'accepted' || status === 'rejected') {
      try {
        await EmailService.sendNotificationFromApplication(updatedApplication);
        console.log(`Email notification sent for application ${id} with status ${status}`);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the API call if email fails
      }

      // Send WhatsApp notification if applicant has verified WhatsApp number
      if (updatedApplication.applicantId.whatsappNumber && updatedApplication.applicantId.whatsappVerified) {
        try {
          const whatsappResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/whatsapp/send-application-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({
              phoneNumber: updatedApplication.applicantId.whatsappNumber,
              applicantName: updatedApplication.applicantId.name,
              jobTitle: updatedApplication.jobId.title,
              companyName: updatedApplication.jobId.company,
              status,
              notes
            })
          });

          if (whatsappResponse.ok) {
            console.log(`WhatsApp notification sent for application ${id} with status ${status}`);
          } else {
            console.error('Failed to send WhatsApp notification:', await whatsappResponse.text());
          }
        } catch (whatsappError) {
          console.error('Failed to send WhatsApp notification:', whatsappError);
          // Don't fail the API call if WhatsApp notification fails
        }
      }
    }
    
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

