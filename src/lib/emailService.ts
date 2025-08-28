import { Resend } from 'resend';
import { Application, Job, User } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailNotificationData {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  applicationStatus: 'accepted' | 'rejected';
  notes?: string;
}

export class EmailService {
  private static instance: EmailService;
  private fromEmail = 'Barlink ID <barlinkid@senze.id>';

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
      
      const { error } = await resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset Password - Barlink ID',
        html: this.getPasswordResetEmailTemplate(resetUrl),
      });

      if (error) {
        console.error('Password reset email sending error:', error);
        return false;
      }

      console.log(`Password reset email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send application status notification email
   */
  async sendApplicationStatusNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      const { subject, htmlContent } = this.generateEmailContent(data);

      const { error } = await resend.emails.send({
        from: this.fromEmail,
        to: data.applicantEmail,
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error('Email sending error:', error);
        return false;
      }

      console.log(`Email notification sent successfully to ${data.applicantEmail} for ${data.applicationStatus} status`);
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  /**
   * Generate email content based on application status
   */
  private generateEmailContent(data: EmailNotificationData): { subject: string; htmlContent: string } {
    const { applicantName, jobTitle, companyName, applicationStatus, notes } = data;

    if (applicationStatus === 'accepted') {
      return {
        subject: `🎉 Selamat! Lamaran Anda Diterima - ${jobTitle} di ${companyName}`,
        htmlContent: this.getAcceptedEmailTemplate(applicantName, jobTitle, companyName, notes),
      };
    } else {
      return {
        subject: `Pemberitahuan Status Lamaran - ${jobTitle} di ${companyName}`,
        htmlContent: this.getRejectedEmailTemplate(applicantName, jobTitle, companyName, notes),
      };
    }
  }

  /**
   * Email template for password reset
   */
  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border: 4px solid #000000;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .reset-button {
            display: inline-block;
            background-color: #FFD700;
            color: #000;
            padding: 15px 30px;
            text-decoration: none;
            font-weight: bold;
            border: 3px solid #000;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #000;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BARLINK</div>
            <div class="title">Reset Password</div>
          </div>
          
          <div class="content">
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mereset password akun Barlink Anda. Klik tombol di bawah ini untuk membuat password baru:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            
            <p>Atau salin dan tempel link berikut di browser Anda:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border: 1px solid #ddd;">${resetUrl}</p>
            
            <p><strong>Link ini akan kedaluwarsa dalam 1 jam.</strong></p>
            
            <p>Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.</p>
          </div>
          
          <div class="footer">
            <p>Email ini dikirim secara otomatis, mohon jangan membalas email ini.</p>
            <p>&copy; 2024 Barlink ID. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email template for accepted applications
   */
  private getAcceptedEmailTemplate(applicantName: string, jobTitle: string, companyName: string, notes?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lamaran Diterima</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border: 4px solid #000000;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            margin: 20px 0;
          }
          .title {
            color: #22c55e;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .content {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .job-details {
            background-color: #f8f9fa;
            border: 2px solid #000;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
          }
          .notes {
            background-color: #e7f3ff;
            border: 2px solid #0066cc;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .cta-button {
            display: inline-block;
            background-color: #000;
            color: #fff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BARLINK</div>
            <div class="success-icon">🎉</div>
            <h1 class="title">Selamat! Lamaran Anda Diterima</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${applicantName}</strong>,</p>
            
            <p>Kami dengan senang hati memberitahukan bahwa lamaran Anda telah <strong>DITERIMA</strong>!</p>
            
            <div class="job-details">
              <h3>📋 Detail Posisi:</h3>
              <p><strong>Posisi:</strong> ${jobTitle}</p>
              <p><strong>Perusahaan:</strong> ${companyName}</p>
            </div>
            
            ${notes ? `
            <div class="notes">
              <h3>💬 Pesan dari Perusahaan:</h3>
              <p>${notes}</p>
            </div>
            ` : ''}
            
            <p>Tim HR dari <strong>${companyName}</strong> akan segera menghubungi Anda untuk tahap selanjutnya dalam proses rekrutmen.</p>
            
            <p>Pastikan untuk:</p>
            <ul>
              <li>Memeriksa email secara berkala</li>
              <li>Menjaga nomor telepon tetap aktif</li>
              <li>Mempersiapkan dokumen yang mungkin diperlukan</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Terima kasih telah menggunakan <strong>Barlink</strong></p>
            <p>Platform terpercaya untuk mencari kerja dan kandidat terbaik</p>
            <p>Jika ada pertanyaan, silakan hubungi kami di <a href="mailto:support@barlink.id">support@barlink.id</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email template for rejected applications
   */
  private getRejectedEmailTemplate(applicantName: string, jobTitle: string, companyName: string, notes?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Status Lamaran</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border: 4px solid #000000;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
          }
          .info-icon {
            font-size: 48px;
            margin: 20px 0;
          }
          .title {
            color: #6b7280;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .content {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .job-details {
            background-color: #f8f9fa;
            border: 2px solid #000;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
          }
          .notes {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .cta-button {
            display: inline-block;
            background-color: #000;
            color: #fff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .encouragement {
            background-color: #e7f3ff;
            border: 2px solid #0066cc;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BARLINK</div>
            <div class="info-icon">📋</div>
            <h1 class="title">Pemberitahuan Status Lamaran</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${applicantName}</strong>,</p>
            
            <p>Terima kasih atas minat Anda untuk bergabung dengan tim kami. Setelah melalui proses seleksi yang ketat, kami informasikan bahwa untuk saat ini lamaran Anda belum dapat kami proses lebih lanjut.</p>
            
            <div class="job-details">
              <h3>📋 Detail Posisi:</h3>
              <p><strong>Posisi:</strong> ${jobTitle}</p>
              <p><strong>Perusahaan:</strong> ${companyName}</p>
            </div>
            
            ${notes ? `
            <div class="notes">
              <h3>💬 Pesan dari Perusahaan:</h3>
              <p>${notes}</p>
            </div>
            ` : ''}
            
            <div class="encouragement">
              <h3>💪 Jangan Menyerah!</h3>
              <p>Keputusan ini tidak mengurangi potensi dan kemampuan Anda. Kami mendorong Anda untuk terus mencari peluang lain yang sesuai dengan keahlian Anda.</p>
            </div>
            
            <p>Saran untuk langkah selanjutnya:</p>
            <ul>
              <li>Terus kembangkan skill dan pengalaman Anda</li>
              <li>Cari peluang lain di platform Barlink</li>
              <li>Jangan ragu untuk melamar posisi lain yang sesuai</li>
              <li>Pertimbangkan untuk memperbarui profil dan CV Anda</li>
            </ul>
            
            <a href="${process.env.NEXTAUTH_URL}/job" class="cta-button">Cari Lowongan Lain</a>
          </div>
          
          <div class="footer">
            <p>Terima kasih telah menggunakan <strong>Barlink</strong></p>
            <p>Platform terpercaya untuk mencari kerja dan kandidat terbaik</p>
            <p>Jika ada pertanyaan, silakan hubungi kami di <a href="mailto:support@barlink.id">support@barlink.id</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send notification based on application data
   */
  async sendNotificationFromApplication(
    application: Application & { applicantId: User; jobId: Job }
  ): Promise<boolean> {
    if (application.status !== 'accepted' && application.status !== 'rejected') {
      return false; // Only send notifications for accepted/rejected status
    }

    const emailData: EmailNotificationData = {
      applicantName: application.applicantId.name,
      applicantEmail: application.applicantId.email,
      jobTitle: application.jobId.title,
      companyName: application.jobId.company,
      applicationStatus: application.status,
      notes: application.notes,
    };

    return await this.sendApplicationStatusNotification(emailData);
  }
}

export default EmailService.getInstance();