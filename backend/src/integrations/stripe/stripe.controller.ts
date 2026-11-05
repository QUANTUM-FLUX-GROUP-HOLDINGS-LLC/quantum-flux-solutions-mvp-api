import { Controller, Post, Body, Req, Headers, BadRequestException, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(@Req() req: any) {
    // Usamos el userId del JWT
    return this.stripeService.createCheckoutSession(req.user.userId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    return this.stripeService.handleWebhook(signature, req.rawBody);
  }
}
