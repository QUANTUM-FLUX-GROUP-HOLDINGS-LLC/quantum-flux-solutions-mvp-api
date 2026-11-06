import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
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

  @Get('documents/:id/download')
  async downloadDocument(@Param('id') id: string) {
    return this.adminService.createSignedUrl(id);
  }
}
