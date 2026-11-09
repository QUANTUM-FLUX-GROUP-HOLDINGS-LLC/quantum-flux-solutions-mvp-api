import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn('RESEND_API_KEY is not set; all email sending will fail.');
    }
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  // Masks the local part of an email so logs stay PII-safe.
  private maskEmail(email: string): string {
    return email.replace(/(.{2}).+(@.+)/, '$1***$2');
  }

  // Single send path with contextual logging. Does NOT swallow errors:
  // each caller decides whether an email failure is fatal to its request.
  private async send(to: string, subject: string, html: string) {
    try {
      await this.resend.emails.send({
        from: 'Quantum Flux <support@quantumfluxsolutions.com>',
        to: [to],
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Email "${subject}" to ${this.maskEmail(to)} failed: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  // Non-critical: registration must succeed even if the welcome email fails.
  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.send(
        to,
        'Welcome to Quantum Flux Solutions!',
        `<h2>Welcome ${name}!</h2><p>Your account is active.</p>`,
      );
    } catch {
      /* already logged in send(); do not fail registration */
    }
  }

  // Non-critical: payment is confirmed regardless of email delivery.
  async sendPaymentSuccessEmail(to: string, name: string) {
    try {
      await this.send(
        to,
        'Payment Confirmed',
        `<h2>Payment Successful</h2><p>Hi ${name}, your payment was received.</p>`,
      );
    } catch {
      /* already logged in send(); payment outcome stands */
    }
  }

  // Non-critical: dispute status already persisted; notify best-effort.
  async sendDisputeStatusUpdate(to: string, name: string, accountName: string, status: string) {
    const statusText =
      status === 'SENT'
        ? 'has been sent to the credit bureau'
        : status === 'RESOLVED'
          ? 'has been resolved'
          : 'was updated';
    try {
      await this.send(
        to,
        `Update on your dispute: ${accountName}`,
        `
          <h2>Dispute Update</h2>
          <p>Hi ${name},</p>
          <p>Your dispute regarding the account <strong>${accountName}</strong> ${statusText}.</p>
          <p>Log in to your portal to view the details.</p>
        `,
      );
    } catch {
      /* already logged in send(); dispute outcome stands */
    }
  }

  // Critical-path email: rethrows so the caller (auth forgot-password)
  // can decide. The controller still responds identically to avoid
  // an enumeration oracle.
  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    await this.send(
      to,
      'Reset your Quantum Flux Solutions password',
      `
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. This link is valid for <strong>15 minutes</strong> and can be used once:</p>
        <p><a href="${resetUrl}">Reset my password</a></p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>If you did not request this, you can safely ignore this email — your password will not change.</p>
      `,
    );
  }

  // Non-critical: best-effort notice to the admin when a staff account
  // attempts self-service recovery. Never throws: the forgot-password
  // response must stay identical for every user (anti-enumeration).
  async sendStaffRecoveryRequestNotice(adminEmail: string, staffEmail: string, staffRole: string) {
    try {
      await this.send(
        adminEmail,
        'Staff password recovery requested',
        `
          <h2>Manual Recovery Required</h2>
          <p>A staff account requested a password reset on the portal.</p>
          <p><strong>Email:</strong> ${staffEmail}</p>
          <p><strong>Role:</strong> ${staffRole}</p>
          <p>Self-service is blocked for staff by policy. Follow the runbook
          (<em>docs/runbooks/staff-password-recovery.md</em>) to issue a
          temporary password after verifying the requester's identity.</p>
        `,
      );
    } catch {
      /* already logged in send(); forgot-password outcome stands */
    }
  }
}
