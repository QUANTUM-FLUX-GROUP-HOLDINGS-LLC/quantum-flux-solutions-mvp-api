import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, data: { bureau: string, accountName: string, accountNumber?: string }) {
    return this.prisma.dispute.create({
      data: { ...data, customerId },
    });
  }

  async findAll(customerId: string) {
    return this.prisma.dispute.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, customerId: string, status: string) {
    const dispute = await this.prisma.dispute.findFirst({ where: { id, customerId } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    
    return this.prisma.dispute.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, customerId: string) {
    const dispute = await this.prisma.dispute.findFirst({ where: { id, customerId } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return this.prisma.dispute.delete({ where: { id } });
  }
}
