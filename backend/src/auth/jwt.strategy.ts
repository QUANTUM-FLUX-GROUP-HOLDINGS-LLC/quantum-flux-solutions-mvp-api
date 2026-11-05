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
    // Buscamos el usuario en la DB para obtener el isAdmin actualizado
    const user = await this.prisma.customer.findUnique({
      where: { id: payload.sub || payload.id }, 
    });
    if (!user) throw new UnauthorizedException();
    
    // Devolvemos el usuario completo (incluye isAdmin)
    return user; 
  }
}
