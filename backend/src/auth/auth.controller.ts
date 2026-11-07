import { Controller, Post, Body, Get, Req, UseGuards 
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

} from '@nestjs/common';
import { AuthService 
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

} from './auth.service';
import { JwtAuthGuard 
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

} from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register({
      email: body.email,
      name: body.name,
      password: body.password,
    
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

});
  
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

}

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    // req.user comes from JwtStrategy (full Prisma Customer). Re-select to
    // keep the response shape explicit and never expose `password`.
    return this.authService.getFreshUser(req.user.id);
  
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

}

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

}
