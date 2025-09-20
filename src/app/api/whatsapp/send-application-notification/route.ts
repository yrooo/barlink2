import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-auth';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createValidationError,
  createAuthorizationError,
  validateRequired,
  validatePhoneNumber 
} from '@/lib/error-handler';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Check authentication - only companies/admin can send notifications
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw createAuthorizationError('Authentication required');
  }

  // Get user profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profileError) {
    throw profileError;
  }
  
  if (!profile) {
    throw createValidationError('User profile not found', { userId: user.id });
  }

  // Check if user is admin (by email) or company
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  const isCompany = profile.role === 'pencari_kandidat';
  
  if (!isAdmin && !isCompany) {
    throw createAuthorizationError(
      'Only companies and administrators can send WhatsApp notifications'
    );
  }

  const body = await request.json();
  const { phoneNumber, applicantName, jobTitle, companyName, status, notes } = body;

  // Validate required fields
  validateRequired(
    { phoneNumber, applicantName, jobTitle, companyName, status },
    ['phoneNumber', 'applicantName', 'jobTitle', 'companyName', 'status']
  );

  // Validate phone number format
  if (!validatePhoneNumber(phoneNumber)) {
    throw createValidationError(
      'Invalid phone number format. Please use international format (e.g., +1234567890)',
      { phoneNumber }
    );
  }

  // Validate status
  const validStatuses = ['accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw createValidationError(
      `Status must be one of: ${validStatuses.join(', ')}`,
      { validStatuses, receivedStatus: status }
    );
  }

    // Proxy request to VPS WhatsApp service
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured
    if (WHATSAPP_API_KEY) {
      headers['X-API-Key'] = WHATSAPP_API_KEY;
    }
    
  // Validate WhatsApp service configuration
  if (!WHATSAPP_SERVICE_URL) {
    throw createValidationError('WhatsApp service is not configured');
  }

  const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/send-application-notification`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      phoneNumber,
      applicantName,
      jobTitle,
      companyName,
      status,
      notes
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw createValidationError(
      result.error || 'Failed to send WhatsApp notification',
      { 
        whatsappServiceStatus: response.status,
        whatsappServiceError: result.error,
        phoneNumber,
        status 
      }
    );
  }

  return createSuccessResponse(
    result,
    `WhatsApp notification sent successfully to ${applicantName}`,
    200
  );
});