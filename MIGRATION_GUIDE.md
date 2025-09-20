# 🚀 Barlink Migration & Setup Guide

This guide provides comprehensive instructions for migrating and setting up the Barlink job-seeking platform in production.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account for deployment
- Supabase account for database
- Resend account for email services
- MongoDB Atlas account (if using MongoDB)
- Domain name (optional but recommended)

## 🔧 Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd barlink2
npm install
```

### 2. Environment Variables Configuration

Copy the production environment template:

```bash
cp .env.production.template .env.local
```

Fill in all required environment variables:

#### Core Application
```env
APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-domain.com
```

#### Database (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Email Service (Resend)
```env
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@your-domain.com
```

#### WhatsApp Integration
```env
WHATSAPP_SERVICE_URL=your-whatsapp-service-url
WHATSAPP_API_KEY=your-whatsapp-api-key
```

#### Security & Rate Limiting
```env
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## 🗄️ Database Migration

### Supabase Setup

1. **Create Supabase Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Note down your project URL and API keys

2. **Run Database Schema**
   ```bash
   # Apply the schema to your Supabase database
   psql -h your-db-host -U postgres -d postgres -f supabase-schema.sql
   ```

3. **Enable Row Level Security (RLS)**
   - Enable RLS on all tables in Supabase dashboard
   - Apply the security policies from `supabase-schema.sql`

### Data Migration (if migrating from existing system)

1. **Export existing data** to CSV/JSON format
2. **Use the migration script**:
   ```bash
   node migrate-data.js
   ```
3. **Verify data integrity** after migration

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all production environment variables
   - Ensure sensitive keys are properly secured

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Custom Server Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

3. **Use PM2 for process management** (recommended)
   ```bash
   npm install -g pm2
   pm2 start npm --name "barlink" -- start
   pm2 save
   pm2 startup
   ```

## 🔒 Security Configuration

### 1. SSL/TLS Setup
- Ensure HTTPS is enabled on your domain
- Configure SSL certificates (Let's Encrypt recommended)
- Update `NEXTAUTH_URL` to use HTTPS

### 2. CORS Configuration
- Configure allowed origins in `next.config.ts`
- Restrict API access to authorized domains

### 3. Rate Limiting
- Configure rate limiting in environment variables
- Monitor API usage and adjust limits as needed

### 4. Security Headers
- Security headers are configured in `next.config.ts`
- Review and adjust based on your security requirements

## 📧 Email Service Setup

### Resend Configuration

1. **Create Resend Account**
   - Sign up at [Resend](https://resend.com)
   - Verify your domain
   - Generate API key

2. **Configure DNS Records**
   - Add SPF, DKIM, and DMARC records
   - Verify domain ownership

3. **Test Email Delivery**
   ```bash
   npm run test:email
   ```

## 📱 WhatsApp Integration

### VPS WhatsApp Service Setup

1. **Deploy WhatsApp Service**
   ```bash
   cd vps-whatsapp-service
   docker-compose up -d
   ```

2. **Generate QR Code**
   ```bash
   node scripts/whatsapp-qr.js
   ```

3. **Scan QR Code** with WhatsApp Business account

## 🧪 Testing

### Pre-deployment Testing

```bash
# Run all tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Security audit
npm run audit:security
```

### Post-deployment Testing

1. **Functionality Tests**
   - User registration and login
   - Job posting and application
   - Email notifications
   - WhatsApp notifications
   - File uploads

2. **Performance Tests**
   - Page load times
   - API response times
   - Database query performance

3. **Security Tests**
   - Authentication flows
   - Authorization checks
   - Input validation
   - Rate limiting

## 📊 Monitoring & Maintenance

### Application Monitoring

1. **Set up monitoring tools**
   - Vercel Analytics (if using Vercel)
   - Sentry for error tracking
   - Uptime monitoring

2. **Database Monitoring**
   - Supabase dashboard metrics
   - Query performance monitoring
   - Storage usage tracking

3. **Email Delivery Monitoring**
   - Resend dashboard metrics
   - Bounce and complaint rates
   - Delivery success rates

### Regular Maintenance

1. **Weekly Tasks**
   - Review error logs
   - Check system performance
   - Monitor user feedback

2. **Monthly Tasks**
   - Update dependencies
   - Security patches
   - Database optimization
   - Backup verification

3. **Quarterly Tasks**
   - Security audit
   - Performance optimization
   - Feature usage analysis
   - Infrastructure review

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues
- Verify Supabase credentials
- Check network connectivity
- Review RLS policies

#### Email Delivery Issues
- Verify Resend API key
- Check domain verification
- Review DNS records

#### WhatsApp Service Issues
- Check service status
- Verify QR code session
- Review API key configuration

### Emergency Procedures

1. **Service Outage**
   - Check Vercel status
   - Verify database connectivity
   - Review error logs
   - Implement fallback procedures

2. **Security Incident**
   - Immediately revoke compromised keys
   - Review access logs
   - Update security measures
   - Notify affected users

3. **Data Loss**
   - Restore from latest backup
   - Verify data integrity
   - Implement additional backup measures

## 📞 Support

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Resend Documentation](https://resend.com/docs)

### Community
- GitHub Issues for bug reports
- Discord/Slack for community support
- Stack Overflow for technical questions

---

## ✅ Migration Checklist

- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Data migrated (if applicable)
- [ ] Email service configured
- [ ] WhatsApp service deployed
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring tools set up
- [ ] Backup procedures implemented
- [ ] Security measures verified
- [ ] Performance testing completed
- [ ] User acceptance testing passed
- [ ] Documentation updated
- [ ] Team training completed

**🎉 Congratulations! Your Barlink platform is now ready for production use.**