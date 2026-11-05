import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TaxService } from './tax.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tax')
@UseGuards(JwtAuthGuard)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get()
  getProfile(@Req() req: any) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.taxService.getProfile(customerId);
  }

  @Post()
  updateProfile(@Req() req: any, @Body() body: any) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.taxService.updateProfile(customerId, body);
  }
}
