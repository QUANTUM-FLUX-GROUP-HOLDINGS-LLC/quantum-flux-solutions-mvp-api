import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class TaxService {
  constructor(private prisma: PrismaService) {}

  async getProfile(customerId: string) {
    let profile = await this.prisma.taxProfile.findUnique({
      where: { customerId },
    });

    // Si no existe, creamos uno por defecto
    if (!profile) {
      profile = await this.prisma.taxProfile.create({
        data: { customerId },
      });
    }
    return profile;
  }

  async updateProfile(customerId: string, data: { filingStatus: string, dependents: number, income: number }) {
    return this.prisma.taxProfile.upsert({
      where: { customerId },
      update: data,
      create: { customerId, ...data },
    });
  }
}
