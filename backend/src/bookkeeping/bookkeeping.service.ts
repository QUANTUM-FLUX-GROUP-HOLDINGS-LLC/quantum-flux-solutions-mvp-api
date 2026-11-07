import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

export interface SaveBookkeepingDto {
  businessName?: string;
  period?: string;
  revenue?: number;
  expenses?: number;
  notes?: string;
}

@Injectable()
export class BookkeepingService {
  constructor(private readonly prisma: PrismaService) {}

  findByCustomer(customerId: string) {
    return this.prisma.bookkeepingProfile.findUnique({ where: { customerId } });
  }

  upsert(customerId: string, data: SaveBookkeepingDto) {
    return this.prisma.bookkeepingProfile.upsert({
      where: { customerId },
      create: { customerId, ...data },
      update: data,
    });
  }
}
