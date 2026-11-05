import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(data: { email: string; password: string; name: string }) {
    const existing = await this.prisma.customer.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(data.password, 10);
    
    // Todos los que se registran en la web pública son CLIENTES por defecto
    const customer = await this.prisma.customer.create({
      data: { email: data.email, password: hash, name: data.name, role: 'CLIENT' },
    });

    await this.mail.sendWelcomeEmail(customer.email, customer.name);
    
    return this.login(customer.email, data.password);
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.customer.findUnique({ where: { email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // El payload incluye el rol para que el JWT lo sepa
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);

    // Devolvemos el token y el objeto user (que incluye el rol)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    };
  }
}
