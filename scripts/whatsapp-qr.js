#!/usr/bin/env node

/**
 * WhatsApp QR Code Generator for Production
 * 
 * This script generates a QR code in the terminal for WhatsApp authentication.
 * Use this in production environments where you can't access the web interface.
 * 
 * Usage: node scripts/whatsapp-qr.js
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Configuration
const SESSION_PATH = path.join(__dirname, '..', '.wwebjs_auth');
const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--single-process',
  '--disable-gpu'
];

console.log('🚀 Starting WhatsApp QR Code Generator...');
console.log('📁 Session path:', SESSION_PATH);

// Create WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'barlink-whatsapp-bot',
    dataPath: SESSION_PATH
  }),
  puppeteer: {
    headless: true,
    args: PUPPETEER_ARGS
  }
});

// Event handlers
client.on('qr', (qr) => {
  console.log('\n📱 Scan this QR code with your WhatsApp:');
  console.log('   1. Open WhatsApp on your phone');
  console.log('   2. Go to Settings > Linked Devices');
  console.log('   3. Tap "Link a Device"');
  console.log('   4. Scan the QR code below:\n');
  
  // Generate QR code in terminal
  qrcode.generate(qr, { small: true });
  
  console.log('\n⏳ Waiting for QR code to be scanned...');
});

client.on('ready', () => {
  console.log('\n✅ WhatsApp client is ready!');
  console.log('🔗 WhatsApp is now connected and ready to send OTP messages.');
  console.log('\n🛑 You can now stop this script (Ctrl+C) and start your application.');
  
  // Keep the process alive for a few seconds to ensure connection is stable
  setTimeout(() => {
    console.log('\n🔄 Connection established. You can now restart your application.');
    process.exit(0);
  }, 5000);
});

client.on('authenticated', () => {
  console.log('\n🔐 WhatsApp authenticated successfully!');
});

client.on('auth_failure', (msg) => {
  console.error('\n❌ Authentication failed:', msg);
  process.exit(1);
});

client.on('disconnected', (reason) => {
  console.log('\n🔌 WhatsApp disconnected:', reason);
  if (reason === 'LOGOUT') {
    console.log('\n🗑️  Session logged out. You\'ll need to scan the QR code again.');
  }
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down WhatsApp QR generator...');
  try {
    await client.destroy();
    console.log('✅ WhatsApp client destroyed successfully.');
  } catch (error) {
    console.error('❌ Error destroying client:', error.message);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Received SIGTERM, shutting down...');
  try {
    await client.destroy();
  } catch (error) {
    console.error('❌ Error destroying client:', error.message);
  }
  process.exit(0);
});

// Initialize the client
console.log('🔄 Initializing WhatsApp client...');
client.initialize().catch((error) => {
  console.error('❌ Failed to initialize WhatsApp client:', error.message);
  process.exit(1);
});

// Timeout after 5 minutes if no QR code is scanned
setTimeout(() => {
  console.log('\n⏰ Timeout: QR code was not scanned within 5 minutes.');
  console.log('🔄 Please run the script again to generate a new QR code.');
  process.exit(1);
}, 5 * 60 * 1000);