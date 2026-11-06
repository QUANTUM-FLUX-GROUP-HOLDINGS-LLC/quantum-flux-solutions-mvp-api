import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TaxService } from './tax.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tax')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxController {
  constructor(private readonly tax: TaxService) {}

  // Ruta para el cliente: llenar sus propios datos
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

  // Ruta para el Staff (Admin o Preparadores): ver datos de un cliente
  @Get('customers/:id')
  @Roles('ADMIN', 'TAX_PERSONAL', 'TAX_BUSINESS')
  getClientProfile(@Param('id') customerId: string) {
    return this.tax.getProfile(customerId);
  }
}
