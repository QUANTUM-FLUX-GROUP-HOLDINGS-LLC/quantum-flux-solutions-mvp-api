import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
  }

  async createCheckoutSession(email: string) {
    return this.stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_mock_149', 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://quantum-flux-solutions-mvp-api.vercel.app/dashboard?success=true',
      cancel_url: 'https://quantum-flux-solutions-mvp-api.vercel.app/dashboard?canceled=true',
    });
  }
}
