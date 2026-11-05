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

  // NUEVO: Correo cuando el Admin aprueba o elimina una disputa
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
}
