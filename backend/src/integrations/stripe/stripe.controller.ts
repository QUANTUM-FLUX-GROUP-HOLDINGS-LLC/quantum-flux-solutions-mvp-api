import { Controller, Post, Body, Req, UseGuards, Headers, RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Req() req: any, @Body('serviceId') serviceId: string) {
    // req.user.id viene del JWT
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.stripeService.createCheckoutSession(userId, serviceId);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    return this.stripeService.handleWebhook(signature, req.rawBody!);
  }
}
