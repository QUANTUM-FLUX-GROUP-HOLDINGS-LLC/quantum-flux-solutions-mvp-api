import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.resend.emails.send({
        from: 'Quantum Flux <support@quantumfluxsolutions.com>',
        to: [to],
        subject: 'Welcome to Quantum Flux Solutions!',
        html: `<h2>Welcome ${name}!</h2><p>Your account is active.</p>`,
      });
    } catch (error) { this.logger.error(error); }
  }

  async sendPaymentSuccessEmail(to: string, name: string) {
    try {
      await this.resend.emails.send({
        from: 'Quantum Flux <support@quantumfluxsolutions.com>',
        to: [to],
        subject: 'Payment Confirmed',
        html: `<h2>Payment Successful</h2><p>Hi ${name}, your payment was received.</p>`,
      });
    } catch (error) { this.logger.error(error); }
  }

  // Email sent when the Admin approves or deletes a dispute
  async sendDisputeStatusUpdate(to: string, name: string, accountName: string, status: string) {
    try {
      const statusText = status === 'SENT' ? 'has been sent to the bureau' : 'has been successfully deleted';
      await this.resend.emails.send({
        from: 'Quantum Flux <support@quantumfluxsolutions.com>',
        to: [to],
        subject: `Update on your dispute: ${accountName}`,
        html: `
          <h2>Dispute Update</h2>
          <p>Hi ${name},</p>
          <p>Your dispute regarding the account <strong>${accountName}</strong> ${statusText}.</p>
          <p>Log in to your portal to view the details.</p>
        `,
      });
    } catch (error) { this.logger.error(error); }
  }

  // One-time password reset link (short-lived signed token). Link expires in 15 minutes.
  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    try {
      await this.resend.emails.send({
        from: 'Quantum Flux <support@quantumfluxsolutions.com>',
        to: [to],
        subject: 'Reset your Quantum Flux Solutions password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. This link is valid for <strong>15 minutes</strong> and can be used once:</p>
          <p><a href="${resetUrl}">Reset my password</a></p>
          <p>If the button does not work, copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
          <p>If you did not request this, you can safely ignore this email — your password will not change.</p>
        `,
      });
    } catch (error) { this.logger.error(error); }
  }
}
