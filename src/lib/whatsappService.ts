import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';

interface OTPData {
  code: string;
  phoneNumber: string;
  expiresAt: Date;
  verified: boolean;
}

class WhatsAppService {
  private client: Client;
  private isReady: boolean = false;
  private qrCode: string = '';
  private otpStore: Map<string, OTPData> = new Map();

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'barlink-whatsapp-bot'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      console.log('QR Code received, generating image...');
      try {
        this.qrCode = await QRCode.toDataURL(qr);
        console.log('QR Code generated successfully');
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing WhatsApp client...');
      await this.client.initialize();
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      throw error;
    }
  }

  getQRCode(): string {
    return this.qrCode;
  }

  isClientReady(): boolean {
    return this.isReady;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string; otpId?: string }> {
    if (!this.isReady) {
      return {
        success: false,
        message: 'WhatsApp client is not ready. Please try again later.'
      };
    }

    try {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      // Ensure phone number starts with country code
      let formattedNumber = cleanPhoneNumber;
      if (!formattedNumber.startsWith('+')) {
        // Assume Indonesian number if no country code
        if (formattedNumber.startsWith('0')) {
          formattedNumber = '+62' + formattedNumber.substring(1);
        } else if (formattedNumber.startsWith('62')) {
          formattedNumber = '+' + formattedNumber;
        } else {
          formattedNumber = '+62' + formattedNumber;
        }
      }

      // Generate OTP
      const otpCode = this.generateOTP();
      const otpId = `${formattedNumber}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP
      this.otpStore.set(otpId, {
        code: otpCode,
        phoneNumber: formattedNumber,
        expiresAt,
        verified: false
      });

      // Send WhatsApp message
      const message = `Kode verifikasi WhatsApp Anda untuk Barlink: ${otpCode}\n\nKode ini akan kedaluwarsa dalam 5 menit.\nJangan bagikan kode ini kepada siapa pun.`;
      
      const chatId = formattedNumber.replace('+', '') + '@c.us';
      await this.client.sendMessage(chatId, message);

      console.log(`OTP sent to ${formattedNumber}: ${otpCode}`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otpId
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please check the phone number and try again.'
      };
    }
  }

  verifyOTP(otpId: string, code: string): { success: boolean; message: string } {
    const otpData = this.otpStore.get(otpId);
    
    if (!otpData) {
      return {
        success: false,
        message: 'Invalid OTP ID or OTP has expired'
      };
    }

    if (otpData.verified) {
      return {
        success: false,
        message: 'OTP has already been used'
      };
    }

    if (new Date() > otpData.expiresAt) {
      this.otpStore.delete(otpId);
      return {
        success: false,
        message: 'OTP has expired'
      };
    }

    if (otpData.code !== code) {
      return {
        success: false,
        message: 'Invalid OTP code'
      };
    }

    // Mark as verified
    otpData.verified = true;
    this.otpStore.set(otpId, otpData);

    // Clean up after successful verification
    setTimeout(() => {
      this.otpStore.delete(otpId);
    }, 60000); // Remove after 1 minute

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  getPhoneNumberFromOtpId(otpId: string): string | null {
    const otpData = this.otpStore.get(otpId);
    return otpData ? otpData.phoneNumber : null;
  }

  findOtpIdByPhoneNumber(phoneNumber: string): string | null {
    // Clean and format phone number to match stored format
    let formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (!formattedNumber.startsWith('+')) {
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+62' + formattedNumber.substring(1);
      } else if (formattedNumber.startsWith('62')) {
        formattedNumber = '+' + formattedNumber;
      } else {
        formattedNumber = '+62' + formattedNumber;
      }
    }

    // Find the most recent OTP for this phone number
    let latestOtpId: string | null = null;
    let latestTimestamp = 0;

    for (const [otpId, otpData] of this.otpStore.entries()) {
      if (otpData.phoneNumber === formattedNumber && !otpData.verified) {
        const timestamp = parseInt(otpId.split('_')[1]);
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestOtpId = otpId;
        }
      }
    }

    return latestOtpId;
  }

  // Clean up expired OTPs periodically
  cleanupExpiredOTPs() {
    const now = new Date();
    for (const [otpId, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(otpId);
      }
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.client.destroy();
      this.isReady = false;
      this.otpStore.clear();
    } catch (error) {
      console.error('Error destroying WhatsApp client:', error);
    }
  }
}

// Singleton instance
let whatsappService: WhatsAppService | null = null;

export function getWhatsAppService(): WhatsAppService {
  if (!whatsappService) {
    whatsappService = new WhatsAppService();
    
    // Initialize the service
    whatsappService.initialize().catch(console.error);
    
    // Clean up expired OTPs every 5 minutes
    setInterval(() => {
      whatsappService?.cleanupExpiredOTPs();
    }, 5 * 60 * 1000);
  }
  
  return whatsappService;
}

export default WhatsAppService;