import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { testAllNotifications, testAcceptedNotification, testRejectedNotification, testCustomNotification } from '@/lib/testEmailNotification';

/**
 * Test API endpoint for email notifications
 * Only accessible in development mode and by authenticated users
 */
export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints are not available in production' },
      { status: 403 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { testType, customData } = body;

    let result = false;
    let message = '';

    switch (testType) {
      case 'accepted':
        result = true;
        await testAcceptedNotification();
        message = 'Accepted notification test completed. Check console logs and email inbox.';
        break;
        
      case 'rejected':
        result = true;
        await testRejectedNotification();
        message = 'Rejected notification test completed. Check console logs and email inbox.';
        break;
        
      case 'all':
        result = true;
        await testAllNotifications();
        message = 'All notification tests completed. Check console logs and email inbox.';
        break;
        
      case 'custom':
        if (!customData) {
          return NextResponse.json(
            { error: 'Custom data is required for custom test type' },
            { status: 400 }
          );
        }
        result = await testCustomNotification(customData);
        message = result 
          ? 'Custom notification test completed successfully. Check console logs and email inbox.'
          : 'Custom notification test failed. Check console logs for errors.';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid test type. Use: accepted, rejected, all, or custom' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message,
      testType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Email notification test error:', error);
    return NextResponse.json(
      { error: 'Failed to run email notification test' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to show test instructions
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints are not available in production' },
      { status: 403 }
    );
  }

  const instructions = {
    title: 'Email Notification Test API',
    description: 'Test the automated email notification system for job applications',
    endpoint: '/api/test/email-notifications',
    method: 'POST',
    authentication: 'Required (any authenticated user)',
    environment: 'Development only',
    testTypes: {
      accepted: {
        description: 'Test accepted application notification',
        payload: { testType: 'accepted' }
      },
      rejected: {
        description: 'Test rejected application notification',
        payload: { testType: 'rejected' }
      },
      all: {
        description: 'Test both accepted and rejected notifications',
        payload: { testType: 'all' }
      },
      custom: {
        description: 'Test with custom data',
        payload: {
          testType: 'custom',
          customData: {
            applicantName: 'Test User',
            applicantEmail: 'test@example.com',
            jobTitle: 'Test Position',
            companyName: 'Test Company',
            applicationStatus: 'accepted', // or 'rejected'
            notes: 'Optional test notes'
          }
        }
      }
    },
    setup: [
      '1. Ensure RESEND_API_KEY is configured in your .env.local',
      '2. Update test email addresses in src/lib/testEmailNotification.ts',
      '3. Make sure you are authenticated in the application',
      '4. Send POST request with appropriate payload',
      '5. Check console logs and email inbox for results'
    ],
    examples: {
      curl: {
        accepted: `curl -X POST http://localhost:3000/api/test/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"testType": "accepted"}'`,
        rejected: `curl -X POST http://localhost:3000/api/test/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"testType": "rejected"}'`,
        all: `curl -X POST http://localhost:3000/api/test/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"testType": "all"}'`
      }
    }
  };

  return NextResponse.json(instructions, { status: 200 });
}