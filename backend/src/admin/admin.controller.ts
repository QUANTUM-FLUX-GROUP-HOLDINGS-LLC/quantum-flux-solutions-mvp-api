import {
  Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Role gate for every /admin endpoint. Blocks CLIENT-role tokens so a
   * regular authenticated user cannot list customers, read metrics or
   * manage accounts. Non-CLIENT roles (ADMIN / staff) pass through.
   */
  private assertStaff(req: any) {
    if (!req.user || req.user.role === 'CLIENT') {
      throw new ForbiddenException('Staff access required.');
    }
  }

  @Get('metrics')
  getMetrics(@Req() req: any) {
    this.assertStaff(req);
    return this.adminService.getDashboardMetrics();
  }

  @Get('clients')
  listClients(@Req() req: any) {
    this.assertStaff(req);
    return this.adminService.listAllCustomers();
  }

  @Post('clients')
  createClient(@Req() req: any, @Body() body: any) {
    this.assertStaff(req);
    return this.adminService.createClient({ name: body.name, email: body.email });
  }

  @Patch('clients/:id')
  updateClient(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.assertStaff(req);
    return this.adminService.updateClient(id, { name: body.name, email: body.email });
  }

  @Delete('clients/:id')
  async deleteClient(@Req() req: any, @Param('id') id: string) {
    this.assertStaff(req);
    if (req.user.id === id) {
      throw new ForbiddenException('You cannot delete your own account.');
    }
    return this.adminService.deleteClient(id);
  }

  @Get('clients/:id/documents')
  listClientDocuments(@Req() req: any, @Param('id') id: string) {
    this.assertStaff(req);
    return this.adminService.listDocuments(id);
  }

  @Get('documents/:id/download')
  async downloadDocument(@Req() req: any, @Param('id') id: string) {
    this.assertStaff(req);
    return this.adminService.createSignedUrl(id);
  }
}
