import { NextRequest, NextResponse } from 'next/server';
import { requireRole, createServerSupabaseClient } from '@/lib/supabase-auth';
import EmailService from '@/lib/emailService';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createValidationError,
  createAuthorizationError,
  validateRequired 
} from '@/lib/error-handler';

export const PATCH = withErrorHandling(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireRole('pencari_kandidat');
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  const { user } = authResult;
  const supabase = await createServerSupabaseClient();
  
  // Verify application belongs to the employer
  const resolvedParams = await context.params;
  const id = resolvedParams.id;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw createValidationError('Invalid application ID format');
  }
    
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select(`
      *,
      applicant:users!applications_applicant_id_fkey(name, email, whatsapp_number, whatsapp_verified),
      job:jobs!applications_job_id_fkey(title, company, employer_id)
    `)
    .eq('id', id)
    .single();
  
  if (fetchError) {
    throw fetchError;
  }
  
  if (!application) {
    throw createValidationError('Application not found', { applicationId: id });
  }

  // Verify that the job belongs to the current user
  if (application.job.employer_id !== user.id) {
    throw createAuthorizationError(
      'You can only update applications for your own jobs'
    );
  }
  
  const body = await request.json();
  const { status, notes } = body;
  
  // Validate required fields
  validateRequired({ status }, ['status']);

  // Validate status value
  const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw createValidationError(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      { validStatuses, receivedStatus: status }
    );
  }
    
  const { data: updatedApplication, error: updateError } = await supabase
    .from('applications')
    .update({ 
      status, 
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      applicant:users!applications_applicant_id_fkey(name, email, whatsapp_number, whatsapp_verified),
      job:jobs!applications_job_id_fkey(title, company)
    `)
    .single();
  
  if (updateError) {
    throw updateError;
  }
    
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
      if (updatedApplication.applicant.whatsapp_number && updatedApplication.applicant.whatsapp_verified) {
        try {
        const appUrl = process.env.APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
        const whatsappResponse = await fetch(`${appUrl}/api/whatsapp/send-application-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({
              phoneNumber: updatedApplication.applicant.whatsapp_number,
              applicantName: updatedApplication.applicant.name,
              jobTitle: updatedApplication.job.title,
              companyName: updatedApplication.job.company,
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
    
  return createSuccessResponse(
    updatedApplication,
    `Application status updated to ${status}`,
    200
  );
});

