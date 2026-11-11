import { Injectable, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { authenticator } from 'otplib';

// Refresh-token lifetime; the access JWT itself lives 15m.
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Tolerate ±1 step (30s) of clock drift between server and authenticator.
authenticator.options = { window: 1 };

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

    // 2FA (staff): once TOTP is confirmed, the password alone is not enough.
    // Instead of a session token, issue a short-lived challenge the user
    // must redeem with a TOTP code at POST /auth/2fa/login.
    if (user.role !== 'CLIENT' && user.totpConfirmed && user.totpSecret) {
      const challenge = this.jwt.sign(
        { sub: user.id, purpose: '2fa-challenge' },
        { expiresIn: '5m' },
      );
      return { twoFactorRequired: true, challenge };
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      token,
      refreshToken,
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

      // Escalate to the administrator so a temporary password can be issued
      // manually (Security roadmap item 1). The notice method never throws.
      const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL;
      if (notifyEmail) {
        await this.mail.sendStaffRecoveryRequestNotice(notifyEmail, user.email, user.role);
      } else {
        this.logger.warn('ADMIN_NOTIFY_EMAIL is not set; staff recovery attempt was not escalated.');
      }
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

  // ------------------------------------------------------------------
  // TOTP 2FA for staff (phase 1). CLIENT accounts are unaffected.
  // Enrollment: setupTotp stores a pending secret; activateTotp confirms
  // it with a first valid code. Login then requires the second factor.
  // Recovery: manual Super Admin runbook clears the TOTP columns.
  // ------------------------------------------------------------------

  private assertStaff(user: { role: string }) {
    if (user.role === 'CLIENT') {
      throw new UnauthorizedException('2FA is available to staff accounts only.');
    }
  }

  async setupTotp(userId: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    this.assertStaff(user);

    const secret = authenticator.generateSecret();
    await this.prisma.customer.update({
      where: { id: userId },
      data: { totpSecret: secret, totpConfirmed: false },
    });

    // otpauth URL lets any authenticator app enroll by link or manual entry.
    const appName = process.env.APP_NAME || 'Quantum Flux Portal';
    const otpauth = authenticator.keyuri(user.email, appName, secret);
    return { otpauth, secret };
  }

  async activateTotp(userId: string, code: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret) throw new UnauthorizedException('2FA setup not started.');

    this.assertStaff(user);

    const ok = authenticator.verify({ token: code, secret: user.totpSecret });
    if (!ok) throw new UnauthorizedException('Invalid verification code.');

    await this.prisma.customer.update({
      where: { id: userId },
      data: { totpConfirmed: true },
    });

    // Issue a fresh batch of one-time recovery codes (phase 2). They are
    // returned ONCE here and stored only as bcrypt hashes; each code can
    // redeem exactly one 2FA challenge. Re-activating rotates the batch.
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      codes.push(`${randomBytes(3).toString('hex')}-${randomBytes(3).toString('hex')}`);
    }
    await this.prisma.$transaction([
      this.prisma.recoveryCode.deleteMany({ where: { userId } }),
      ...codes.map((c) =>
        this.prisma.recoveryCode.create({
          data: { userId, codeHash: bcrypt.hashSync(c, 10) },
        }),
      ),
    ]);

    return {
      message: '2FA enabled. Future logins will require a code.',
      recoveryCodes: codes,
    };
  }

  // ------------------------------------------------------------------
  // Rotating refresh tokens (session hardening, cycle 014). The access
  // JWT is short-lived (15m); these opaque tokens extend the session.
  // Every refresh rotates the token; reusing an already-rotated token
  // revokes the user's whole chain (theft detection). Only SHA-256
  // hashes are persisted.
  // ------------------------------------------------------------------

  private async issueRefreshToken(userId: string) {
    const raw = randomBytes(48).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: createHash('sha256').update(raw).digest('hex'),
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
    return raw;
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored) throw new UnauthorizedException('Invalid refresh token.');

    if (stored.revokedAt) {
      // This token was already rotated; assume theft and revoke the chain.
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Invalid refresh token.');
    }
    if (stored.expiresAt <= new Date()) throw new UnauthorizedException('Expired refresh token.');

    // Rotate: retire the presented token, then issue a fresh pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    const user = await this.prisma.customer.findUnique({ where: { id: stored.userId } });
    if (!user) throw new UnauthorizedException('Invalid refresh token.');

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = await this.issueRefreshToken(user.id);
    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        services: user.services ?? [],
      },
    };
  }

  async revokeAllSessions(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'All sessions revoked.' };
  }

  /**
   * Single-use recovery-code redemption for the 2FA login step. Codes are
   * stored as bcrypt hashes, so all unused codes of the user are compared
   * (at most 8). Consumption is atomic: updateMany marks exactly one row
   * and only proceeds when it matched an UNUSED code (race-safe).
   */
  private async tryRecoveryCode(userId: string, code: string): Promise<boolean> {
    const unused = await this.prisma.recoveryCode.findMany({
      where: { userId, usedAt: null },
    });
    for (const row of unused) {
      if (bcrypt.compareSync(code, row.codeHash)) {
        const marked = await this.prisma.recoveryCode.updateMany({
          where: { id: row.id, userId, usedAt: null },
          data: { usedAt: new Date() },
        });
        return marked.count === 1;
      }
    }
    return false;
  }

  // Second step of login: redeems the short-lived 2fa-challenge token.
  async loginWithTotp(challenge: string, code: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(challenge);
    } catch {
      throw new UnauthorizedException('Invalid or expired challenge.');
    }

    // Reject session/reset tokens repurposed as 2FA challenges.
    if (payload.purpose !== '2fa-challenge') {
      throw new UnauthorizedException('Invalid challenge token.');
    }

    const user = await this.prisma.customer.findUnique({ where: { id: payload.sub } });
    if (!user || !user.totpConfirmed || !user.totpSecret) {
      throw new UnauthorizedException('2FA is not enabled for this account.');
    }

    const ok = authenticator.verify({ token: code, secret: user.totpSecret })
      || (await this.tryRecoveryCode(user.id, code));
    if (!ok) throw new UnauthorizedException('Invalid verification code.');

    // Same session shape as the standard login success path.
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = await this.issueRefreshToken(user.id);
    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        services: user.services ?? [],
      },
    };
  }
}
