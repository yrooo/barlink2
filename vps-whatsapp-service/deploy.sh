#!/bin/bash

# Barlink WhatsApp VPS Deployment Script
# This script automates the deployment of the WhatsApp service on your VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="barlink-whatsapp"
APP_DIR="/var/www/$APP_NAME"
GIT_REPO="https://github.com/yrooo/barlink2.git"  # Replace with your actual repo URL
NODE_VERSION="18"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

install_dependencies() {
    log_info "Installing system dependencies..."
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install essential packages
    apt-get install -y curl wget git nginx ufw fail2ban
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Install PM2 globally
    npm install -g pm2
    
    # Install Docker (optional)
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER
        
        # Install Docker Compose
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    log_success "Dependencies installed successfully"
}

setup_firewall() {
    log_info "Configuring firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (adjust port if needed)
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow WhatsApp service port (only from localhost if using nginx)
    ufw allow from 127.0.0.1 to any port 3001
    
    # Enable firewall
    ufw --force enable
    
    log_success "Firewall configured successfully"
}

setup_application() {
    log_info "Setting up application..."
    
    # Create application directory
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # Clone repository (if not already cloned)
    if [ ! -d ".git" ]; then
        log_info "Cloning repository..."
        git clone $GIT_REPO .
    else
        log_info "Updating repository..."
        git pull origin main
    fi
    
    # Navigate to WhatsApp service directory
    cd vps-whatsapp-service
    
    # Install dependencies
    log_info "Installing Node.js dependencies..."
    npm install --production
    
    # Create necessary directories
    mkdir -p logs pids .wwebjs_auth
    
    # Set up environment file
    if [ ! -f ".env" ]; then
        log_info "Creating environment file..."
        cp .env.example .env
        log_warning "Please edit .env file with your configuration"
    fi
    
    # Set proper permissions
    chown -R www-data:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    
    log_success "Application setup completed"
}

setup_pm2() {
    log_info "Setting up PM2 process manager..."
    
    cd $APP_DIR/vps-whatsapp-service
    
    # Update ecosystem.config.js with correct paths
    sed -i "s|YOUR_VPS_IP|$(curl -s ifconfig.me)|g" ecosystem.config.js
    sed -i "s|YOUR_GITHUB_REPO_URL|$GIT_REPO|g" ecosystem.config.js
    
    # Start application with PM2
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root
    
    log_success "PM2 setup completed"
}

setup_nginx() {
    log_info "Setting up Nginx reverse proxy..."
    
    cd $APP_DIR/vps-whatsapp-service
    
    # Backup default nginx config
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    
    # Copy our nginx configuration
    cp nginx.conf /etc/nginx/nginx.conf
    
    # Test nginx configuration
    nginx -t
    
    # Restart nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log_success "Nginx setup completed"
}

setup_ssl() {
    log_info "Setting up SSL with Let's Encrypt (optional)..."
    
    # Install certbot
    apt-get install -y certbot python3-certbot-nginx
    
    log_warning "To setup SSL, run: certbot --nginx -d your-domain.com"
    log_warning "Make sure your domain points to this server's IP first"
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    
    # Check PM2 status
    echo "PM2 Status:"
    pm2 status
    echo ""
    
    # Check Nginx status
    echo "Nginx Status:"
    systemctl status nginx --no-pager -l
    echo ""
    
    # Check application health
    echo "Application Health:"
    curl -s http://localhost:3001/health | jq . || echo "Health check failed"
    echo ""
    
    # Show useful commands
    log_info "Useful commands:"
    echo "  View logs: pm2 logs $APP_NAME"
    echo "  Restart app: pm2 restart $APP_NAME"
    echo "  Stop app: pm2 stop $APP_NAME"
    echo "  Nginx logs: tail -f /var/log/nginx/error.log"
    echo "  Check firewall: ufw status"
    echo ""
    
    log_success "Deployment completed successfully!"
    log_info "Your WhatsApp service is running on: http://$(curl -s ifconfig.me):80"
    log_warning "Don't forget to update your Vercel app's environment variables!"
}

# Main deployment process
main() {
    log_info "Starting Barlink WhatsApp VPS deployment..."
    
    check_root
    install_dependencies
    setup_firewall
    setup_application
    setup_pm2
    setup_nginx
    setup_ssl
    show_status
}

# Run main function
main "$@"