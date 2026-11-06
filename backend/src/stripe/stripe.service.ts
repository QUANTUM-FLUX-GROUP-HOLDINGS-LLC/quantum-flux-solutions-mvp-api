import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    // Usa la variable de entorno para no exponer la llave real
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(email: string) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          // Este Price ID lo debes crear en el dashboard de Stripe
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
