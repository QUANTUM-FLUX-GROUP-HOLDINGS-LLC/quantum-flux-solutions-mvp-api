import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async createCheckout(@Body('email') email: string) {
    const session = await this.stripeService.createCheckoutSession(email);
    return { url: session.url };
  }
}
