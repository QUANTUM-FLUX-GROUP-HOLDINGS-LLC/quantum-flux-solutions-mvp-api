import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('metrics')
  @Roles('ADMIN', 'CREDIT_REPAIR', 'TAX_PERSONAL', 'TAX_BUSINESS', 'BOOKKEEPING')
  getMetrics() { return this.admin.getDashboardMetrics(); }

  @Get('customers')
  @Roles('ADMIN', 'CREDIT_REPAIR', 'TAX_PERSONAL', 'TAX_BUSINESS', 'BOOKKEEPING')
  listCustomers() { return this.admin.listAllCustomers(); }

  @Get('customers/:id/documents')
  @Roles('ADMIN', 'CREDIT_REPAIR', 'TAX_PERSONAL', 'TAX_BUSINESS', 'BOOKKEEPING')
  listDocuments(@Param('id') id: string) { return this.admin.listDocuments(id); }

  @Get('documents/:id/download')
  @Roles('ADMIN', 'CREDIT_REPAIR', 'TAX_PERSONAL', 'TAX_BUSINESS', 'BOOKKEEPING')
  downloadDocument(@Param('id') id: string) { return this.admin.createSignedUrl(id); }
}
