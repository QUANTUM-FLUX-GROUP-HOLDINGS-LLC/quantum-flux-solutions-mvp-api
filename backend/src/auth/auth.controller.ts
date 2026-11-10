import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register({
      email: body.email,
      name: body.name,
      password: body.password,
    });
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  // Public by design: the user is logged out when requesting a reset link.
  // The response is identical whether or not the account exists (no email enumeration).
  @Post('forgot-password')
  forgotPassword(@Body() body: any) {
    return this.authService.requestPasswordReset(body.email);
  }

  // Public: consumes the one-time signed reset token issued above.
  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    // req.user comes from JwtStrategy (full Prisma Customer). Re-select to
    // keep the response shape explicit and never expose `password`.
    return this.authService.getFreshUser(req.user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

  // -------------------------------------------------------------------
  // TOTP 2FA (staff). Setup/activate require a valid session; the second
  // login step redeems the challenge issued by POST /auth/login.
  // -------------------------------------------------------------------

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  setupTotp(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.authService.setupTotp(userId);
  }

  @Post('2fa/activate')
  @UseGuards(JwtAuthGuard)
  activateTotp(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub;
    return this.authService.activateTotp(userId, body.code);
  }

  // Public: challenge comes from login, code from the authenticator app.
  @Post('2fa/login')
  loginWithTotp(@Body() body: any) {
    return this.authService.loginWithTotp(body.challenge, body.code);
  }
}
