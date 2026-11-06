import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(customerId: string) {
    return this.prisma.taxProfile.findUnique({ where: { customerId } });
  }

  async updateProfile(customerId: string, data: any) {
    return this.prisma.taxProfile.upsert({
      where: { customerId },
      update: data,
      create: { customerId, ...data },
    });
  }
}
