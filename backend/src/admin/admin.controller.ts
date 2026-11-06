import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('clients')
  async getAllClients() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });
  }
}
