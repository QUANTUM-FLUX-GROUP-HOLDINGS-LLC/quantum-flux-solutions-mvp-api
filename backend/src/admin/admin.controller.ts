import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('clients')
  async getAllClients(@Query('role') role: string) {
    const whereClause = role === 'ADMIN' ? {} : { role: 'CLIENT' };
    return this.prisma.customer.findMany({ where: whereClause, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
  }

  @Post('clients')
  async createClient(@Body() body: any) {
    return this.prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password || 'password123', // En producción esto debe encriptarse con bcrypt
        role: 'CLIENT'
      }
    });
  }
}
