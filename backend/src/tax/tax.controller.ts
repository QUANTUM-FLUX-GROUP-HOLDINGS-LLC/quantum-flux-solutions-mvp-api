import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TaxService } from './tax.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tax')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxController {
  constructor(private readonly tax: TaxService) {}

  // Client route: fill in their own data
  @Get('profile')
  @Roles('CLIENT')
  getMyProfile(@Req() req: any) {
    return this.tax.getProfile(req.user.id);
  }

  @Post('profile')
  @Roles('CLIENT')
  updateMyProfile(@Req() req: any, @Body() body: any) {
    return this.tax.updateProfile(req.user.id, body);
  }

  // Staff route (Admin or preparers): view a client's data
  @Get('customers/:id')
  @Roles('ADMIN', 'TAX_PERSONAL', 'TAX_BUSINESS')
  getClientProfile(@Param('id') customerId: string) {
    return this.tax.getProfile(customerId);
  }
}
