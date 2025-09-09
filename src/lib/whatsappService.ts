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

  private async sendRequest(endpoint: string, data: any): Promise<{ success: boolean; message: string }> {
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to send WhatsApp notification to ${endpoint}. Status: ${response.status}`, errorData);
        return { success: false, message: errorData.error || 'Unknown error occurred' };
      }

      const result = await response.json();
      console.log(`Successfully sent WhatsApp notification to ${endpoint}`);
      return { success: true, message: result.message };
    } catch (error) {
      console.error(`Error sending request to WhatsApp service at ${endpoint}:`, error);
      return { success: false, message: 'Failed to connect to WhatsApp service' };
    }
  }

  public async sendApplicationNotification(data: ApplicationNotificationData): Promise<{ success: boolean; message: string }> {
    console.log(`Attempting to send application notification for ${data.applicantName} to ${data.phoneNumber}`);
    return this.sendRequest('send-application-notification', data);
  }

  public async sendInterviewNotification(data: InterviewNotificationData): Promise<{ success: boolean; message: string }> {
    console.log(`Attempting to send interview notification for ${data.applicantName} to ${data.phoneNumber}`);
    return this.sendRequest('send-interview-notification', data);
  }
}

// Singleton instance to be used throughout the application
const whatsappService = new WhatsAppService();

export default whatsappService;
