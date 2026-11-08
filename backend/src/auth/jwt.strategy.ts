import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    // Tokens issued for a specific purpose (e.g. password-reset) must not
    // work as session tokens, even though they are validly signed JWTs.
    if (payload.purpose) {
      throw new UnauthorizedException();
    }

    // Load the user and return the full object (which already includes 'role')
    const user = await this.prisma.customer.findUnique({
      where: { id: payload.sub || payload.id },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
