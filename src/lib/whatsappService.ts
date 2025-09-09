/**
 * WhatsAppService Client
 *
 * This service acts as a client to communicate with the standalone
 * vps-whatsapp-service. It is responsible for sending notifications
 * for various events like application status changes and interview schedules.
 */

// Define the structure for application notifications
interface ApplicationNotificationData {
  phoneNumber: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: 'accepted' | 'rejected';
  notes?: string;
}

// Define the structure for interview notifications
interface InterviewNotificationData {
  phoneNumber: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'online' | 'offline';
  location?: string;
  meetingLink?: string;
  notes?: string;
}

class WhatsAppService {
  private serviceUrl: string;
  private apiKey: string;

  constructor() {
    this.serviceUrl = process.env.VPS_WHATSAPP_SERVICE_URL || 'http://localhost:3001';
    this.apiKey = process.env.VPS_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️ VPS_API_KEY is not set. WhatsApp notifications will likely fail.');
    }
  }

  private async sendRequest(endpoint: string, data: any): Promise<any> {
    const url = `${this.serviceUrl}/api/whatsapp/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`Failed request to ${endpoint}. Status: ${response.status}`, result);
        // Throw an error that can be caught by the calling function
        throw new Error(result.error || 'Unknown error occurred');
      }

      console.log(`Successful request to ${endpoint}`);
      return result;
    } catch (error) {
      console.error(`Error sending request to WhatsApp service at ${endpoint}:`, error);
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }

  public async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string; otpId: string }> {
    console.log(`Attempting to send OTP to ${phoneNumber}`);
    try {
      const result = await this.sendRequest('send-otp', { phoneNumber });
      return result;
    } catch (error: any) {
      return { success: false, message: error.message, otpId: '' };
    }
  }

  public async verifyOTP(otpId: string, code: string): Promise<{ success: boolean; message: string; phoneNumber?: string }> {
    console.log(`Attempting to verify OTP for otpId: ${otpId}`);
    try {
      const result = await this.sendRequest('verify-otp', { otpId, code });
      return result;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  public async sendApplicationNotification(data: ApplicationNotificationData): Promise<{ success: boolean; message: string }> {
    console.log(`Attempting to send application notification for ${data.applicantName} to ${data.phoneNumber}`);
    try {
      await this.sendRequest('send-application-notification', data);
      return { success: true, message: 'Application notification sent successfully.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  public async sendInterviewNotification(data: InterviewNotificationData): Promise<{ success: boolean; message: string }> {
    console.log(`Attempting to send interview notification for ${data.applicantName} to ${data.phoneNumber}`);
    try {
      await this.sendRequest('send-interview-notification', data);
      return { success: true, message: 'Interview notification sent successfully.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

// Singleton instance to be used throughout the application
const whatsappService = new WhatsAppService();

export default whatsappService;
