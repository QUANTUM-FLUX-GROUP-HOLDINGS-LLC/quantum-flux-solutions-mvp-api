import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TaxBusinessService } from './tax-business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tax-business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxBusinessController {
  constructor(private readonly taxBusiness: TaxBusinessService) {}

  // Cliente llenando sus propios datos
  @Get('profile')
  @Roles('CLIENT')
  getMyProfile(@Req() req: any) {
    return this.taxBusiness.getProfile(req.user.id);
  }

  @Post('profile')
  @Roles('CLIENT')
  updateMyProfile(@Req() req: any, @Body() body: any) {
    return this.taxBusiness.updateProfile(req.user.id, body);
  }

  // Staff (Admin o Preparador Business) viendo los datos de un cliente
  @Get('customers/:id')
  @Roles('ADMIN', 'TAX_BUSINESS')
  getClientProfile(@Param('id') customerId: string) {
    return this.taxBusiness.getProfile(customerId);
  }
}
