import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, name: string, pass: string) {
    const existingUser = await this.prisma.customer.findUnique({ where: { email } });
    if (existingUser && existingUser.password) {
      throw new ConflictException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    if (existingUser) {
      await this.prisma.customer.update({
        where: { email },
        data: { password: hashedPassword, name },
      });
      return this.login(email, pass);
    }

    const user = await this.prisma.customer.create({
      data: { email, name, password: hashedPassword },
    });

    return this.login(email, pass);
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.customer.findUnique({ where: { email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, status: user.status },
    };
  }

  // NUEVO: Obtener datos frescos del usuario
  async getMe(userId: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return { id: user.id, name: user.name, email: user.email, status: user.status };
  }
}
