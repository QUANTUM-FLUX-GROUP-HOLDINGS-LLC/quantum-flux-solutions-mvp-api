import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('customers')
  listCustomers() {
    return this.admin.listActiveCustomers();
  }

  @Get('customers/:id/documents')
  listDocuments(@Param('id') id: string) {
    return this.admin.listDocuments(id);
  }

  @Get('documents/:id/download')
  downloadDocument(@Param('id') id: string) {
    return this.admin.createSignedUrl(id);
  }
}
