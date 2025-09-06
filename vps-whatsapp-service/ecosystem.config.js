module.exports = {
  apps: [{
    name: 'barlink-whatsapp',
    script: 'server.js',
    instances: 1, // Single instance for WhatsApp (can't run multiple instances)
    autorestart: true,
    watch: false, // Don't watch files in production
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      ALLOWED_ORIGINS: 'https://barlink2.vercel.app/'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001,
      ALLOWED_ORIGINS: 'http://localhost:3000,https://barlink2.vercel.app/'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Restart policy
    min_uptime: '10s',
    max_restarts: 10,
    // Advanced PM2 features
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Health monitoring
    health_check_grace_period: 3000,
    // Log rotation
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    // Process management
    pid_file: './pids/barlink-whatsapp.pid',
    // Environment specific settings
    node_args: '--max-old-space-size=1024'
  }],

  deploy: {
    production: {
      user: 'barlink', // Change to your VPS user
      host: '159.89.205.251', // Replace with your VPS IP
      ref: 'origin/main',
      repo: 'https://github.com/yrooo/barlink2.git', // Replace with your GitHub repo
      path: '/var/www/barlink-whatsapp',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/barlink-whatsapp/logs && mkdir -p /var/www/barlink-whatsapp/pids'
    }
  }
};