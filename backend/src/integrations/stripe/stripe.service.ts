import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
  }

  async createCheckoutSession(customerId: string, serviceId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error('Customer not found');

    const session = await this.stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Quantum Flux - ${serviceId.toUpperCase()}` },
          unit_amount: 14900,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
      client_reference_id: customer.id,
      metadata: { serviceId }
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    const hasRealSecret = !!webhookSecret && webhookSecret !== 'whsec_...';

    // Fail closed: in production we refuse to accept unsigned payloads.
    if (isProduction && !hasRealSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET is not configured in production. Rejecting webhook.');
      throw new Error('Webhook secret not configured.');
    }
    if (hasRealSecret && !signature) {
      this.logger.error('Missing stripe-signature header.');
      throw new Error('Missing stripe-signature header.');
    }

    let event: Stripe.Event;
    try {
      if (hasRealSecret) {
        event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret!);
      } else {
        this.logger.warn('Webhook signature verification BYPASSED (dev mode, no secret).');
        event = JSON.parse(payload.toString());
      }
    } catch (err: any) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.client_reference_id;
      const serviceId = session.metadata?.serviceId;

      if (customerId && serviceId) {
        const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
        if (customer) {
          const currentServices = customer.services || [];
          if (!currentServices.includes(serviceId)) {
            await this.prisma.customer.update({
              where: { id: customerId },
              data: { services: { push: serviceId } }
            });
            this.logger.log(`Service ${serviceId} activated for customer ${customerId}`);
          } else {
            this.logger.log(`Service ${serviceId} already active for customer ${customerId} (idempotent no-op)`);
          }
        }
      }
    }
    return { received: true };
  }
}
