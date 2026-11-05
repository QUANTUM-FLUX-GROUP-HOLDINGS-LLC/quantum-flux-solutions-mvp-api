import { Controller, Get, Param, UseGuards, Patch, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('customers')
  @Roles('ADMIN', 'CREDIT_REPAIR', 'TAX_PERSONAL', 'TAX_BUSINESS', 'BOOKKEEPING')
  listCustomers() {
    return this.admin.listAllCustomers();
  }

  @Get('customers/:id/documents')
  @Roles('ADMIN', 'CREDIT_REPAIR', 'TAX_PERSONAL', 'TAX_BUSINESS', 'BOOKKEEPING')
  listDocuments(@Param('id') id: string) {
    return this.admin.listDocuments(id);
  }

  @Get('disputes')
  @Roles('ADMIN', 'CREDIT_REPAIR')
  listDisputes() {
    return this.admin.listAllDisputes();
  }

  @Patch('disputes/:id')
  @Roles('ADMIN', 'CREDIT_REPAIR')
  updateDispute(@Param('id') id: string, @Body('status') status: string) {
    return this.admin.updateDisputeStatus(id, status);
  }

  @Post('customers/:id/disputes')
  @Roles('ADMIN', 'CREDIT_REPAIR')
  createDisputeForCustomer(@Param('id') id: string, @Body() body: any) {
    return this.admin.createDisputeForCustomer(id, body);
  }
}
