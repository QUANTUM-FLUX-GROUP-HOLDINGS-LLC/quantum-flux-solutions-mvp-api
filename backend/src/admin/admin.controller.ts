import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('clients')
  async getAllClients(@Query('role') role: string) {
    // Si es ADMIN, ve todo. Si no, solo ve a los usuarios con rol CLIENT.
    const whereClause = role === 'ADMIN' ? {} : { role: 'CLIENT' };
    
    return this.prisma.customer.findMany({
      where: whereClause,
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
