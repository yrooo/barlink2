# Barlink WhatsApp VPS Service

A standalone WhatsApp service designed to run on your VPS while your main application runs on Vercel. This service handles WhatsApp OTP verification and QR code generation.

## 🏗️ Architecture

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Vercel App    │ ──────────────► │   VPS Service   │
│  (Frontend +    │                 │   (WhatsApp     │
│   Other APIs)   │ ◄────────────── │    Bot Only)    │
└─────────────────┘                 └─────────────────┘
```

## 📋 Prerequisites

- DigitalOcean VPS (1GB RAM minimum)
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 16+ and npm
- Domain name (optional, for SSL)

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

1. **Clone your repository on the VPS:**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/vps-whatsapp-service
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

3. **Configure environment variables:**
   ```bash
   nano .env
   ```
   Update the `.env` file with your Vercel app URL.

4. **Restart the service:**
   ```bash
   pm2 restart barlink-whatsapp
   ```

### Option 2: Manual Deployment

1. **Install dependencies:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and setup:**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/vps-whatsapp-service
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your settings
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

### Option 3: Docker Deployment

1. **Using Docker Compose:**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/vps-whatsapp-service
   
   # Edit docker-compose.yml with your settings
   nano docker-compose.yml
   
   # Start services
   docker-compose up -d
   ```

2. **Using Docker only:**
   ```bash
   docker build -t barlink-whatsapp .
   docker run -d -p 3001:3001 --name barlink-whatsapp-service barlink-whatsapp
   ```

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# CORS - Add your Vercel app URLs
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-domain.com

# Optional configurations...
```

### PM2 Configuration

Edit `ecosystem.config.js` to match your setup:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001,
  ALLOWED_ORIGINS: 'https://your-vercel-app.vercel.app'
}
```

## 🔗 API Endpoints

The service provides these endpoints for your Vercel app:

- `GET /health` - Health check
- `GET /api/whatsapp/qr` - Get QR code for WhatsApp setup
- `POST /api/whatsapp/send-otp` - Send OTP via WhatsApp
- `POST /api/whatsapp/verify-otp` - Verify OTP code

## 🔧 Connecting to Vercel App

### 1. Update Vercel Environment Variables

In your Vercel dashboard, add:

```
WHATSAPP_SERVICE_URL=http://your-vps-ip:3001
# or with domain: https://your-domain.com
```

### 2. Update Your Vercel API Routes

Modify your existing WhatsApp API routes to proxy requests to the VPS:

```javascript
// In your Vercel API routes
const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL;

export async function GET() {
  const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/qr`);
  return Response.json(await response.json());
}
```

## 🛠️ Management Commands

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs barlink-whatsapp

# Restart service
pm2 restart barlink-whatsapp

# Stop service
pm2 stop barlink-whatsapp

# Monitor in real-time
pm2 monit
```

### Docker Commands
```bash
# View logs
docker-compose logs -f whatsapp-service

# Restart service
docker-compose restart whatsapp-service

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 🔒 Security

### Firewall Setup
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### SSL Setup (Optional)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### System Resources
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check running processes
top
```

## 🐛 Troubleshooting

### Common Issues

1. **Service won't start:**
   ```bash
   # Check logs
   pm2 logs barlink-whatsapp
   
   # Check if port is in use
   sudo netstat -tlnp | grep 3001
   ```

2. **WhatsApp won't connect:**
   ```bash
   # Clear session data
   rm -rf .wwebjs_auth
   pm2 restart barlink-whatsapp
   ```

3. **CORS errors:**
   - Verify `ALLOWED_ORIGINS` in `.env`
   - Check Vercel app URL is correct

4. **Memory issues on 1GB VPS:**
   ```bash
   # Add swap space
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Log Locations
- PM2 logs: `~/.pm2/logs/`
- Application logs: `./logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## 🔄 Updates

To update the service:

```bash
cd /var/www/barlink-whatsapp/vps-whatsapp-service
git pull origin main
npm install
pm2 restart barlink-whatsapp
```

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Verify your configuration
3. Ensure your VPS has enough resources
4. Check firewall settings
5. Verify network connectivity between VPS and Vercel

## 📝 Notes

- The service stores WhatsApp session data in `.wwebjs_auth/`
- OTP data is stored in memory (consider Redis for production)
- The service automatically handles Indonesian phone number formatting
- QR codes expire and regenerate automatically
- Session data persists between restarts

---

**Happy coding! 🚀**