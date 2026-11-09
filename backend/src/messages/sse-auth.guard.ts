import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Same validation as JwtAuthGuard, but accepts the session token as a
 * ?token= query parameter for EventSource connections, which cannot
 * set custom Authorization headers.
 */
@Injectable()
export class SseAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!req.headers?.authorization && req.query?.token) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    return super.canActivate(context);
  }
}
