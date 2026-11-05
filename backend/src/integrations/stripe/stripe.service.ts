import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
  }

  // Crear sesión de pago usando el ID de nuestro DB, no el de Stripe
  async createCheckoutSession(userId: string): Promise<any> {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let stripeCustomerId = user.stripeId;

    // Si el usuario no tiene un ID de Stripe (ej. se registró por Auth), lo creamos
    if (!stripeCustomerId) {
      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('...')) {
        stripeCustomerId = 'cus_mock_' + Math.random().toString(36).substring(7);
      } else {
        const stripeCustomer = await this.stripe.customers.create({ email: user.email, name: user.name });
        stripeCustomerId = stripeCustomer.id;
      }
      await this.prisma.customer.update({
        where: { id: user.id },
        data: { stripeId: stripeCustomerId },
      });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('...')) {
      return { url: 'https://example.com/checkout-mock-success' };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Full Credit Repair Plan' },
              unit_amount: 14900,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:3001/dashboard?success=true', // Redirige al dashboard
        cancel_url: 'http://localhost:3001/dashboard?canceled=true',
      } as any);
      return { url: session.url };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    let event: Stripe.Event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) return { received: true };

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (!customerId) return { received: true };

      console.log(`✅ Payment successful for customer: ${customerId}. Updating DB...`);

      try {
        await this.prisma.customer.update({
          where: { stripeId: customerId },
          data: { status: 'ACTIVE' },
        });
        console.log(`🎉 DB Updated successfully for ${customerId}`);
      } catch (error) {
        console.log(`⚠️ Customer ${customerId} not found in DB.`);
      }
    }
    return { received: true };
  }
}
