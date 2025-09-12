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

  // ✅ Format nomor ke format WhatsApp (selalu 62xxx@c.us)
  formatPhoneNumber(phone) {
    phone = phone.replace(/\D/g, ''); // buang karakter non-angka
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    }
    if (!phone.startsWith('62')) {
      phone = '62' + phone;
    }
    return phone + '@c.us';
  }

  // ✅ Helper kirim pesan dengan retry (biar ga gampang error "Evaluation failed: b")
  async safeSendMessage(chatId, message, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`📤 Sending message (attempt ${i + 1}/${retries}) → ${chatId}`);
        const result = await this.client.sendMessage(chatId, message);
        console.log(`✅ Message sent to ${chatId}`);
        return result;
      } catch (err) {
        console.error(`⚠️ sendMessage gagal (attempt ${i + 1}):`, err.message);
        if (i === retries - 1) throw err; // habis retry → throw error
        await new Promise(r => setTimeout(r, 2000)); // tunggu 2 detik sebelum retry
      }
    }
  }

  // ✅ Kirim notifikasi aplikasi
  async sendApplicationNotification(data) {
    const timestamp = new Date().toISOString();
    console.log(`\n📱 [${timestamp}] Starting application notification send...`);
    console.log('📋 Request data:', JSON.stringify(data, null, 2));
    
    try {
      if (!this.isClientReady()) {
        console.log('❌ WhatsApp client is not ready');
        return { success: false, message: 'WhatsApp service is not ready' };
      }
      console.log('✅ WhatsApp client is ready');

      const { phoneNumber, applicantName, jobTitle, companyName, status, notes } = data;
      
      // Validate required fields
      if (!phoneNumber || !applicantName || !jobTitle || !companyName || !status) {
        console.log('❌ Missing required fields:', { phoneNumber: !!phoneNumber, applicantName: !!applicantName, jobTitle: !!jobTitle, companyName: !!companyName, status: !!status });
        return { success: false, message: 'Missing required fields' };
      }
      
      const chatId = this.formatPhoneNumber(phoneNumber);
      console.log(`📞 Original phone: ${phoneNumber}`);
      console.log(`💬 Formatted Chat ID: ${chatId}`);
      
      // Check if number is registered on WhatsApp
      console.log('🔍 Checking if number is registered on WhatsApp...');
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        console.error(`❌ Number is not registered on WhatsApp: ${chatId}`);
        return { success: false, message: `Number ${phoneNumber} is not registered on WhatsApp` };
      }
      console.log('✅ Number is registered on WhatsApp');
      
      let message = '';

      if (status === 'accepted') {
        message = 
`🎉 *Selamat ${applicantName}!*

Lamaran Anda untuk posisi *${jobTitle}* di *${companyName}* telah *DITERIMA*!

📧 Cek email Anda untuk informasi lebih lanjut.`;
      } else {
        message = 
`📋 *Update Lamaran - ${companyName}*

Halo *${applicantName}*,

Terima kasih atas minat Anda pada posisi *${jobTitle}*. Setelah evaluasi, kami informasikan bahwa lamaran Anda belum dapat kami proses lebih lanjut.

📧 Cek email Anda untuk informasi lebih lanjut.`;
      }

      console.log(`📝 Message preview: ${message.substring(0, 100)}...`);
      
      console.log('🚀 Sending application notification via WhatsApp Web...');
      const result = await this.safeSendMessage(chatId, message);
      console.log('✅ Application notification sent successfully!');
      console.log('📊 Send result:', result?.id || 'No message ID returned');

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      console.error('❌ Error sending application notification:', error);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      return { success: false, message: 'Failed to send notification', error: error.message };
    }
  }

  // ✅ Kirim notifikasi interview
  async sendInterviewNotification(data) {
    const timestamp = new Date().toISOString();
    console.log(`\n📅 [${timestamp}] Starting interview notification send...`);
    console.log('📋 Request data:', JSON.stringify(data, null, 2));
    
    try {
      if (!this.isClientReady()) {
        console.log('❌ WhatsApp client is not ready');
        return { success: false, message: 'WhatsApp service is not ready' };
      }
      console.log('✅ WhatsApp client is ready');

      const { phoneNumber, applicantName, jobTitle, companyName, interviewDate, 
              interviewTime, interviewType, location, meetingLink, notes } = data;
      
      // Validate required fields
      if (!phoneNumber || !applicantName || !jobTitle || !companyName || !interviewDate || !interviewTime) {
        console.log('❌ Missing required fields:', { 
          phoneNumber: !!phoneNumber, 
          applicantName: !!applicantName, 
          jobTitle: !!jobTitle, 
          companyName: !!companyName,
          interviewDate: !!interviewDate,
          interviewTime: !!interviewTime
        });
        return { success: false, message: 'Missing required fields' };
      }

      const chatId = this.formatPhoneNumber(phoneNumber);
      console.log(`📞 Original phone: ${phoneNumber}`);
      console.log(`💬 Formatted Chat ID: ${chatId}`);
      
      // Check if number is registered on WhatsApp
      console.log('🔍 Checking if number is registered on WhatsApp...');
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        console.error(`❌ Number is not registered on WhatsApp: ${chatId}`);
        return { success: false, message: `Number ${phoneNumber} is not registered on WhatsApp` };
      }
      console.log('✅ Number is registered on WhatsApp');

      const message = `Halo ${applicantName}, Interview Anda untuk posisi ${jobTitle} di ${companyName} telah dijadwalkan.`;

      console.log(`📝 Message preview: ${message.substring(0, 100)}...`);
      
      console.log('🚀 Sending interview notification via WhatsApp Web...');
      const result = await this.safeSendMessage(chatId, message);
      console.log('✅ Interview notification sent successfully!');
      console.log('📊 Send result:', result?.id || 'No message ID returned');

      return { success: true, message: 'Interview notification sent successfully' };
    } catch (error) {
      console.error('❌ Error sending interview notification:', error);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      return { success: false, message: 'Failed to send interview notification', error: error.message };
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
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n🌐 [${timestamp}] API Request [${requestId}]: /api/whatsapp/send-application-notification`);
  console.log('📨 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const result = await whatsappService.sendApplicationNotification(req.body);
    
    console.log(`📤 [${requestId}] API Response:`, JSON.stringify(result, null, 2));
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error(`❌ [${requestId}] Error in send-application-notification API:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/whatsapp/send-interview-notification', async (req, res) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n🌐 [${timestamp}] API Request [${requestId}]: /api/whatsapp/send-interview-notification`);
  console.log('📨 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const result = await whatsappService.sendInterviewNotification(req.body);
    
    console.log(`📤 [${requestId}] API Response:`, JSON.stringify(result, null, 2));
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error(`❌ [${requestId}] Error in send-interview-notification API:`, error);
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