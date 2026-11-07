import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BookkeepingService } from './bookkeeping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('bookkeeping')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookkeepingController {
  constructor(private readonly service: BookkeepingService) {}

  @Get('profile')
  @Roles('CLIENT')
  getOwn(@Req() req: any) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.service.findByCustomer(customerId);
  }

  @Post('profile')
  @Roles('CLIENT')
  upsertOwn(@Req() req: any, @Body() body: any) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.service.upsert(customerId, body);
  }

  @Get('customers/:id')
  @Roles('ADMIN', 'BOOKKEEPING')
  getCustomer(@Param('id') id: string) {
    return this.service.findByCustomer(id);
  }
}
