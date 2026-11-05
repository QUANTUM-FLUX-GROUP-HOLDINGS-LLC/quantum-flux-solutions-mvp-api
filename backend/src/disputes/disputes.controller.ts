import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.disputes.create(customerId, body);
  }

  @Get()
  findAll(@Req() req: any) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.disputes.findAll(customerId);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body('status') status: string) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.disputes.updateStatus(id, customerId, status);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.disputes.remove(id, customerId);
  }
}
