import { Controller, Get, Param, UseGuards, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('customers')
  listCustomers() {
    return this.admin.listAllCustomers();
  }

  @Get('customers/:id/documents')
  listDocuments(@Param('id') id: string) {
    return this.admin.listDocuments(id);
  }

  @Get('documents/:id/download')
  downloadDocument(@Param('id') id: string) {
    return this.admin.createSignedUrl(id);
  }

  @Get('disputes')
  listDisputes() {
    return this.admin.listAllDisputes();
  }

  @Patch('disputes/:id')
  updateDispute(@Param('id') id: string, @Body('status') status: string) {
    return this.admin.updateDisputeStatus(id, status);
  }
}
