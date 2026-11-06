import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TaxBusinessService } from './tax-business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

@Controller('tax-business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxBusinessController {
  constructor(private readonly taxBusiness: TaxBusinessService) {}

  @Get('profile')
  @Roles('CLIENT')
  getMyProfile(@Req() req: any) {
    return this.taxBusiness.getProfile(req.user.id);
  }

  @Post('profile')
  @Roles('CLIENT')
  updateMyProfile(@Req() req: any, @Body() body: UpdateBusinessProfileDto) {
    return this.taxBusiness.updateProfile(req.user.id, body);
  }

  @Get('customers/:id')
  @Roles('ADMIN', 'TAX_BUSINESS')
  getClientProfile(@Param('id') customerId: string) {
    return this.taxBusiness.getProfile(customerId);
  }

  @Post('customers/:id')
  @Roles('ADMIN', 'TAX_BUSINESS')
  updateClientProfile(@Param('id') customerId: string, @Body() body: UpdateBusinessProfileDto) {
    return this.taxBusiness.updateProfile(customerId, body);
  }
}
