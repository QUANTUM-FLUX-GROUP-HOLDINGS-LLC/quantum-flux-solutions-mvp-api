import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Usamos la API Key desde las variables de entorno
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.resend.emails.send({
        from: 'Quantum Flux <onboarding@resend.dev>', // Dominio de pruebas de Resend
        to: [to],
        subject: 'Welcome to Quantum Flux Solutions!',
        html: `
          <h2>Welcome ${name}!</h2>
          <p>Thank you for registering with Quantum Flux Solutions.</p>
          <p>Your account is currently <strong>PENDING</strong>.</p>
          <p>Please activate your plan ($149/mo) from your dashboard to start using our Credit Repair, Taxes, and Bookkeeping services.</p>
          <br/>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0f4c81; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        `,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
    }
  }

  async sendPaymentSuccessEmail(to: string, name: string) {
    try {
      await this.resend.emails.send({
        from: 'Quantum Flux <billing@resend.dev>',
        to: [to],
        subject: 'Payment Confirmed - Quantum Flux Solutions',
        html: `
          <h2>Payment Successful!</h2>
          <p>Hi ${name},</p>
          <p>We have successfully received your payment of <strong>$149.00</strong>.</p>
          <p>Your account status is now <strong>ACTIVE</strong>. You can now upload your credit reports and access all our services.</p>
          <br/>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0f4c81; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Now</a>
        `,
      });
      this.logger.log(`Payment success email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send payment email to ${to}`, error);
    }
  }
}
