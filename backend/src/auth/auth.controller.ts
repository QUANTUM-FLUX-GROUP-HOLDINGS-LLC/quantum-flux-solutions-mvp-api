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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    // req.user comes from JwtStrategy (full Prisma Customer). Re-select to
    // keep the response shape explicit and never expose `password`.
    return this.authService.getFreshUser(req.user.id);
  }
}
