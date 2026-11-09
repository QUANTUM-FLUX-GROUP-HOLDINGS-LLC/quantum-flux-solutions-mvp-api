import { Injectable, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(data: { email: string; password: string; name: string }) {
    const existing = await this.prisma.customer.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(data.password, 10);

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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        // FIX: entitlements must reach the client on login,
        // otherwise dashboard/PortalLayout treat every service as locked.
        services: user.services ?? [],
      },
    };
  }

  // Fresh, sanitized profile for /auth/me.
  // JwtStrategy already loads the full Customer, but we re-select here so the
  // response shape is explicit and `password` never leaks to the client.
  async getFreshUser(userId: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        services: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

  // ------------------------------------------------------------------
  // Password reset flow.
  //
  // Stateless design: a short-lived signed JWT with `purpose: 'password-reset'`
  // travels by email. No DB migration needed (no reset-token columns).
  // Trade-off accepted for MVP: the token cannot be revoked, but expires in 15m.
  // ------------------------------------------------------------------

  async requestPasswordReset(email: string) {
    const user = await this.prisma.customer.findUnique({ where: { email } });

    // Same response either way so attackers cannot probe for registered emails.
    // Policy: self-service email reset is restricted to CLIENT accounts.
    // Allowing staff (ADMIN and module roles) to recover by email means a
    // compromised mailbox grants platform control. Staff recovery is a
    // manual Super Admin flow (runbook: docs/runbooks/staff-password-recovery.md).
    if (user && user.role !== 'CLIENT') {
      const masked = user.email.replace(/(.{2}).+(@.+)/, '$1***$2');
      this.logger.warn(
        `Blocked self-service reset for staff account ${masked} (${user.role}); manual recovery required.`,
      );
    } else if (user) {
      const token = this.jwt.sign(
        { sub: user.id, purpose: 'password-reset' },
        { expiresIn: '15m' },
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

      // A provider outage must not turn this endpoint into an enumeration
      // oracle (error for existing accounts, success for others). Log and move on.
      try {
        await this.mail.sendPasswordResetEmail(user.email, user.name, resetUrl);
      } catch (err) {
        const masked = user.email.replace(/(.{2}).+(@.+)/, '$1***$2');
        this.logger.error(
          `Password reset email failed for ${masked}: ${(err as Error).message}`,
        );
      }
    }

    return { message: 'If the account exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset link.');
    }

    // Reject session tokens (or anything else) repurposed as reset tokens.
    if (payload.purpose !== 'password-reset') {
      throw new UnauthorizedException('Invalid reset token.');
    }

    const user = await this.prisma.customer.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Invalid or expired reset link.');

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.customer.update({
      where: { id: user.id },
      data: { password: hash },
    });

    return { message: 'Password updated. You can now log in.' };
  }

}
