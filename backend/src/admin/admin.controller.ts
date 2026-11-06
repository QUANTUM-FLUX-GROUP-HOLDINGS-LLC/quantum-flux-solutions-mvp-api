import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  getMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('clients')
  listClients() {
    return this.adminService.listAllCustomers();
  }

  @Get('clients/:id/documents')
  listClientDocuments(@Param('id') id: string) {
    return this.adminService.listDocuments(id);
  }
}
