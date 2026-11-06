import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TaxBusinessService } from './tax-business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tax-business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxBusinessController {
  constructor(private readonly taxBusiness: TaxBusinessService) {}

  // Ruta para el cliente
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

  // Ruta para el Staff (Leer datos del cliente)
  @Get('customers/:id')
  @Roles('ADMIN', 'TAX_BUSINESS')
  getClientProfile(@Param('id') customerId: string) {
    return this.taxBusiness.getProfile(customerId);
  }

  // NUEVA RUTA: Para que el Staff guarde/actualice los datos del cliente
  @Post('customers/:id')
  @Roles('ADMIN', 'TAX_BUSINESS')
  updateClientProfile(@Param('id') customerId: string, @Body() body: any) {
    return this.taxBusiness.updateProfile(customerId, body);
  }
}
