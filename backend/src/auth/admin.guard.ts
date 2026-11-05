import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // Verificamos estrictamente que req.user existe y isAdmin es true
    if (!req.user || req.user.isAdmin !== true) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
