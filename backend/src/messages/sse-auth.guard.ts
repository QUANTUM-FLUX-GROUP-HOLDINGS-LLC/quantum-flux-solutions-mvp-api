import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SseTicketsService } from './sse-tickets.service';

/**
 * Authenticates the SSE inbox stream with a single-use ticket issued by
 * POST /messages/stream-ticket (which itself requires the normal Bearer
 * JWT). Replaces the former ?token= passthrough, so the long-lived
 * session JWT never appears in a URL.
 */
@Injectable()
export class SseAuthGuard implements CanActivate {
  constructor(private readonly tickets: SseTicketsService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ticket = req.query?.ticket;
    if (!ticket) {
      throw new UnauthorizedException('Missing stream ticket.');
    }
    const claims = this.tickets.consume(String(ticket));
    if (!claims) {
      throw new UnauthorizedException('Invalid or expired stream ticket.');
    }
    req.user = claims;
    return true;
  }
}
