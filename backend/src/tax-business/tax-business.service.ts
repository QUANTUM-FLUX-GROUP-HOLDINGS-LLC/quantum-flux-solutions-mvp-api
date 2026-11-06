import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class TaxBusinessService {
  constructor(private prisma: PrismaService) {}

  async findOne(customerId: string) {
    return this.prisma.businessTaxProfile.findUnique({
      where: { customerId },
    });
  }

  async upsertProfile(customerId: string, data: any) {
    return this.prisma.businessTaxProfile.upsert({
      where: { customerId },
      update: {
        entityType: data.entityType,
        ein: data.ein,
        grossRevenue: parseFloat(data.grossRevenue) || 0,
        hasEmployees: data.hasEmployees,
        notes: data.notes,
      },
      create: {
        customerId,
        entityType: data.entityType,
        ein: data.ein,
        grossRevenue: parseFloat(data.grossRevenue) || 0,
        hasEmployees: data.hasEmployees,
        notes: data.notes,
      },
    });
  }
}
