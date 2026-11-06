import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class TaxBusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(customerId: string) {
    return this.prisma.businessTaxProfile.findUnique({ where: { customerId } });
  }

  async updateProfile(customerId: string, data: any) {
    return this.prisma.businessTaxProfile.upsert({
      where: { customerId },
      update: data,
      create: { customerId, ...data },
    });
  }
}
