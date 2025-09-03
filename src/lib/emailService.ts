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

export interface InterviewScheduleEmailData {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'online' | 'offline';
  location?: string;
  meetingLink?: string;
  notes: string;
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
   * Send interview schedule email
   */
  async sendInterviewScheduleEmail(data: InterviewScheduleEmailData): Promise<boolean> {
    try {
      const { error } = await resend.emails.send({
        from: this.fromEmail,
        to: data.applicantEmail,
        subject: `Interview Scheduled - ${data.jobTitle} at ${data.companyName}`,
        html: this.getInterviewScheduleEmailTemplate(data),
      });

      if (error) {
        console.error('Interview schedule email sending error:', error);
        return false;
      }

      console.log(`Interview schedule email sent successfully to ${data.applicantEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send interview schedule email:', error);
      return false;
    }
  }

  /**
   * Email template for interview schedule
   */
  private getInterviewScheduleEmailTemplate(data: InterviewScheduleEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interview Scheduled - Barlink ID</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Barlink ID</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Platform Pencarian Kerja Terpercaya</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #155724; margin: 0 0 10px 0; font-size: 20px;">📅 Interview Dijadwalkan</h2>
              <p style="color: #155724; margin: 0; font-size: 14px;">Selamat! Interview Anda telah dijadwalkan</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${data.applicantName}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Kami dengan senang hati memberitahukan bahwa interview Anda untuk posisi <strong>${data.jobTitle}</strong> di <strong>${data.companyName}</strong> telah dijadwalkan.
            </p>
            
            <div style="background: #fff; border: 2px solid #007bff; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #007bff; margin: 0 0 20px 0; font-size: 18px;">📋 Detail Interview</h3>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">📅 Tanggal:</strong>
                <span style="color: #007bff; font-weight: bold;">${data.interviewDate}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">🕐 Waktu:</strong>
                <span style="color: #007bff; font-weight: bold;">${data.interviewTime} WIB</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">💼 Posisi:</strong>
                <span style="color: #007bff; font-weight: bold;">${data.jobTitle}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">🏢 Perusahaan:</strong>
                <span style="color: #007bff; font-weight: bold;">${data.companyName}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">${data.interviewType === 'online' ? '💻' : '📍'} Jenis Interview:</strong>
                <span style="color: #007bff; font-weight: bold;">${data.interviewType === 'online' ? 'Online' : 'Offline'}</span>
              </div>
              
              ${data.interviewType === 'online' && data.meetingLink ? `
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">🔗 Link Meeting:</strong><br>
                <a href="${data.meetingLink}" style="color: #007bff; word-break: break-all;">${data.meetingLink}</a>
              </div>
              ` : ''}
              
              ${data.interviewType === 'offline' && data.location ? `
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">📍 Lokasi:</strong>
                <span style="color: #007bff;">${data.location}</span>
              </div>
              ` : ''}
            </div>
            
            ${data.notes ? `
            <div style="background: #e2e3e5; border-left: 4px solid #6c757d; padding: 15px; margin: 20px 0;">
              <h4 style="color: #495057; margin: 0 0 10px 0; font-size: 16px;">💬 Catatan Tambahan:</h4>
              <p style="color: #6c757d; margin: 0;">${data.notes}</p>
            </div>
            ` : ''}
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">💡 Tips Persiapan Interview</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Pelajari profil perusahaan dan posisi yang dilamar</li>
                <li>Siapkan pertanyaan untuk pewawancara</li>
                <li>Pastikan koneksi internet stabil (untuk interview online)</li>
                <li>Berpakaian profesional dan datang tepat waktu</li>
                <li>Bawa dokumen yang diperlukan (CV, portofolio, dll)</li>
              </ul>
            </div>
            
            <div style="border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                Semoga sukses dalam interview Anda! Jika ada pertanyaan, silakan hubungi perusahaan terkait.
              </p>
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
            <p style="margin: 0;">&copy; 2024 Barlink ID. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">
              <a href="${process.env.NEXTAUTH_URL}" style="color: #667eea; text-decoration: none;">www.barlink.id</a>
            </p>
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