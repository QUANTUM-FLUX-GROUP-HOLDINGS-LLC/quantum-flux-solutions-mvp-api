import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SseTicketsService } from './sse-tickets.service';

/**
 * Issues single-use tickets for the SSE inbox stream. Requires the
 * normal Bearer JWT; the SSE endpoint itself accepts only tickets.
 */
@Controller('messages')
export class StreamTicketsController {
  constructor(private readonly tickets: SseTicketsService) {}

  @Post('stream-ticket')
  @UseGuards(JwtAuthGuard)
  issue(@Req() req: any) {
    return this.tickets.issue(req.user);
  }
}
