#!/usr/bin/env node

/**
 * Standalone WhatsApp Service for VPS Deployment
 * 
 * This service runs independently on your VPS and provides WhatsApp functionality
 * for your Vercel-hosted frontend through HTTP API endpoints.
 */

const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 3001;
const SESSION_PATH = path.join(__dirname, '.wwebjs_auth');
const API_KEY = process.env.VPS_API_KEY; // Required API key for authentication
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'https://your-vercel-app.vercel.app'];

const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--single-process',
  '--disable-gpu',
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor'
];

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());

// API Key Authentication Middleware
const authenticateAPIKey = (req, res, next) => {
  // Skip authentication for health check
  if (req.path === '/health') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!API_KEY) {
    console.warn('⚠️ VPS_API_KEY not set in environment variables');
    return next(); // Allow requests if no API key is configured (development mode)
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required. Include X-API-Key header or Authorization Bearer token.'
    });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

// Apply API key authentication to all routes except health
app.use(authenticateAPIKey);

// WhatsApp Service Class
class VPSWhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
    this.otpStore = new Map();
    this.initializeClient();
  }

  initializeClient() {
    console.log('🚀 Initializing WhatsApp client...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'barlink-whatsapp-bot',
        dataPath: SESSION_PATH
      }),
      puppeteer: {
        headless: true,
        args: PUPPETEER_ARGS
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      console.log('📱 QR Code received');
      try {
        this.qrCode = await qrcode.toDataURL(qr);
        console.log('✅ QR Code generated successfully');
      } catch (error) {
        console.error('❌ Error generating QR code:', error);
      }
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp client is ready!');
      this.isReady = true;
      this.qrCode = null;
    });

    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Authentication failed:', msg);
      this.isReady = false;
    });

    this.client.on('disconnected', (reason) => {
      console.log('🔌 WhatsApp disconnected:', reason);
      this.isReady = false;
      if (reason === 'LOGOUT') {
        this.qrCode = null;
      }
    });
  }

  async initialize() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp client:', error);
      throw error;
    }
  }

  getQRCode() {
    return this.qrCode;
  }

  isClientReady() {
    return this.isReady;
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber) {
    try {
      if (!this.isClientReady()) {
        return {
          success: false,
          message: 'WhatsApp service is not ready'
        };
      }

      // Clean and format phone number
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

      console.log(`📤 OTP sent to ${formattedNumber}: ${otpCode}`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otpId
      };
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please check the phone number and try again.'
      };
    }
  }

  verifyOTP(otpId, code) {
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
      message: 'OTP verified successfully',
      phoneNumber: otpData.phoneNumber
    };
  }

  findOtpIdByPhoneNumber(phoneNumber) {
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
    let latestOtpId = null;
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

  cleanupExpiredOTPs() {
    const now = new Date();
    for (const [otpId, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(otpId);
      }
    }
  }

  async destroy() {
    try {
      await this.client.destroy();
      this.isReady = false;
      this.otpStore.clear();
    } catch (error) {
      console.error('❌ Error destroying WhatsApp client:', error);
    }
  }

  async sendApplicationNotification(data) {
    try {
      if (!this.isClientReady()) {
        return { success: false, message: 'WhatsApp service is not ready' };
      }

      const { phoneNumber, applicantName, jobTitle, companyName, status, notes } = data;
      let message = '';

      if (status === 'accepted') {
        message = `🎉 *Selamat ${applicantName}!*\n\nLamaran Anda untuk posisi *${jobTitle}* di *${companyName}* telah *DITERIMA*!\n\n`;
        message += `📧 Cek email Anda untuk informasi lebih lanjut.\n\n`;
      } else {
        message = `📋 *Update Lamaran - ${companyName}*\n\n`;
        message += `Halo ${applicantName},\n\n`;
        message += `Terima kasih atas minat Anda pada posisi *${jobTitle}*. Setelah evaluasi, kami informasikan bahwa lamaran Anda belum dapat kami proses lebih lanjut.\n\n`;
        message += `📧 Cek email Anda untuk informasi lebih lanjut.\n\n`;
      }

      if (notes) {
        message += `💬 *Pesan:*\n${notes}\n\n`;
      }

      message += '— *Barlink ID*';

      const chatId = phoneNumber.replace('+', '') + '@c.us';
      await this.client.sendMessage(chatId, message);

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      console.error('Error sending application notification:', error);
      return { success: false, message: 'Failed to send notification' };
    }
  }

  async sendInterviewNotification(data) {
    try {
      if (!this.isClientReady()) {
        return { success: false, message: 'WhatsApp service is not ready' };
      }

      const { phoneNumber, applicantName, jobTitle, companyName, interviewDate, 
              interviewTime, interviewType, location, meetingLink, notes } = data;

      let message = `📅 *Interview Dijadwalkan*\n\n`;
      message += `Halo *${applicantName}*,\n\n`;
      message += `Interview Anda untuk posisi *${jobTitle}* di *${companyName}* telah dijadwalkan.\n\n`;
      message += `*Detail Interview:*\n`;
      message += `📆 Tanggal: ${interviewDate}\n`;
      message += `⏰ Waktu: ${interviewTime} WIB\n`;
      message += `📍 Jenis: ${interviewType === 'online' ? 'Online' : 'Offline'}\n`;

      if (interviewType === 'online' && meetingLink) {
        message += `🔗 Link Meeting: ${meetingLink}\n`;
      }

      if (interviewType === 'offline' && location) {
        message += `📍 Lokasi: ${location}\n`;
      }

      if (notes) {
        message += `\n💬 *Catatan:*\n${notes}\n`;
      }

      message += '\n📧 Cek email Anda untuk informasi lebih lanjut.\n\n';
      message += '*Tips Persiapan:*\n';
      message += '• Pelajari profil perusahaan\n';
      message += '• Siapkan dokumen yang diperlukan\n';
      message += '• Datang tepat waktu\n';
      message += interviewType === 'online' ? '• Pastikan koneksi internet stabil\n' : '';

      message += '\n— *Barlink ID*';

      const chatId = phoneNumber.replace('+', '') + '@c.us';
      await this.client.sendMessage(chatId, message);

      return { success: true, message: 'Interview notification sent successfully' };
    } catch (error) {
      console.error('Error sending interview notification:', error);
      return { success: false, message: 'Failed to send interview notification' };
    }
  }
}

// Initialize WhatsApp service
const whatsappService = new VPSWhatsAppService();

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    whatsappReady: whatsappService.isClientReady(),
    timestamp: new Date().toISOString()
  });
});

// Get QR Code
app.get('/api/whatsapp/qr', (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();
    const isReady = whatsappService.isClientReady();

    if (isReady) {
      return res.json({
        success: true,
        isReady: true,
        message: 'WhatsApp is ready'
      });
    }

    if (qrCode) {
      return res.json({
        success: true,
        qrCode,
        isReady: false,
        message: 'QR code available for scanning'
      });
    }

    res.json({
      success: false,
      isReady: false,
      message: 'QR code not available yet. Please wait...'
    });
  } catch (error) {
    console.error('❌ Error getting QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Send OTP
app.post('/api/whatsapp/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const result = await whatsappService.sendOTP(phoneNumber);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        otpId: result.otpId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error in send-otp API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify OTP
app.post('/api/whatsapp/verify-otp', (req, res) => {
  try {
    const { otpId, code, phoneNumber, otpCode } = req.body;

    // Support both formats
    let finalOtpId = otpId;
    let finalCode = code || otpCode;

    if (!finalOtpId && phoneNumber) {
      finalOtpId = whatsappService.findOtpIdByPhoneNumber(phoneNumber);
    }

    if (!finalOtpId || !finalCode) {
      return res.status(400).json({
        success: false,
        error: 'OTP ID/phone number and code are required'
      });
    }

    const verificationResult = whatsappService.verifyOTP(finalOtpId, finalCode);

    if (verificationResult.success) {
      res.json({
        success: true,
        message: verificationResult.message,
        phoneNumber: verificationResult.phoneNumber
      });
    } else {
      res.status(400).json({
        success: false,
        error: verificationResult.message
      });
    }
  } catch (error) {
    console.error('❌ Error in verify-otp API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/whatsapp/send-application-notification', async (req, res) => {
  try {
    const result = await whatsappService.sendApplicationNotification(req.body);
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('Error in send-application-notification API:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/whatsapp/send-interview-notification', async (req, res) => {
  try {
    const result = await whatsappService.sendInterviewNotification(req.body);
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('Error in send-interview-notification API:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down WhatsApp service...');
  try {
    await whatsappService.destroy();
    console.log('✅ WhatsApp service destroyed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  try {
    await whatsappService.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp VPS Service running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 QR endpoint: http://localhost:${PORT}/api/whatsapp/qr`);
  
  // Initialize WhatsApp client
  whatsappService.initialize().catch(console.error);
  
  // Clean up expired OTPs every 5 minutes
  setInterval(() => {
    whatsappService.cleanupExpiredOTPs();
  }, 5 * 60 * 1000);
});