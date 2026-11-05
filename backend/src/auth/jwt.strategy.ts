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
    // Buscamos al usuario en la DB en CADA petición
    const user = await this.prisma.customer.findUnique({
      where: { id: payload.sub || payload.id },
    });
    if (!user) throw new UnauthorizedException('User not found');
    
    // Retornamos el usuario con su isAdmin actualizado de la DB
    return { ...user, isAdmin: user.isAdmin === true };
  }
}
