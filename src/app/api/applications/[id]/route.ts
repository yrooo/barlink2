import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ApplicationService } from '@/lib/services/applicationService';
// import EmailService from '@/lib/emailService'; // TODO: Re-enable when type issues are resolved

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'pencari_kandidat') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify application belongs to the employer
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const application = await ApplicationService.getApplicationById(id);
    
    if (!application || application.employer_id !== user.id) {
      return NextResponse.json(
        { error: 'Application not found or unauthorized' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { status, notes } = body;
    
    const updatedApplication = await ApplicationService.updateApplicationStatus(
      id,
      status,
      notes
    );
    
    if (!updatedApplication) {
      return NextResponse.json(
        { success: false, error: 'Failed to update application' },
        { status: 500 }
      );
    }
    
    // Send email notification for accepted/rejected applications
    if (status === 'accepted' || status === 'rejected') {
      // Get full application details with populated relations for notifications
      const fullApplication = await ApplicationService.getApplicationById(id);
      
      if (fullApplication) {
        try {
          // TODO: Fix type mismatch for EmailService.sendNotificationFromApplication
          // await EmailService.sendNotificationFromApplication(fullApplication);
          console.log(`Email notification would be sent for application ${id} with status ${status}`);
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the API call if email fails
        }

        // TODO: Send WhatsApp notification if applicant has verified WhatsApp number
        // Note: WhatsApp fields may not be available in current user schema
        /*
        if (fullApplication.applicant?.whatsapp_number && fullApplication.applicant?.whatsapp_verified) {
          try {
            const whatsappResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/whatsapp/send-application-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
              },
              body: JSON.stringify({
                phoneNumber: fullApplication.applicant.whatsapp_number,
                applicantName: fullApplication.applicant.name,
                jobTitle: fullApplication.job.title,
                companyName: fullApplication.job.company,
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
        */
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

