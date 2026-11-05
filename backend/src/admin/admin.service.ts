import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async listAllCustomers() {
    return this.prisma.customer.findMany({
      select: { id: true, email: true, name: true, status: true, createdAt: true },
    });
  }

  async listDocuments(customerId: string) {
    return this.prisma.document.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSignedUrl(documentId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const { data, error } = await this.supabase.storage.createSignedUrl(doc.storagePath, 600);
    if (error) throw new InternalServerErrorException(error.message);

    return { url: data.signedUrl, expiresIn: 600, fileName: doc.fileName };
  }

  async listAllDisputes() {
    return this.prisma.dispute.findMany({
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateDisputeStatus(id: string, status: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return this.prisma.dispute.update({ where: { id }, data: { status } });
  }

  async createDisputeForCustomer(customerId: string, data: { bureau: string, accountName: string, accountNumber?: string }) {
    return this.prisma.dispute.create({
      data: {
        ...data,
        customerId,
        status: 'PENDING', // Se crea en pending para que el admin luego lo apruebe
      },
    });
  }

  // OPCIÓN 3: Obtener el perfil de impuestos del cliente
  async getCustomerTaxProfile(customerId: string) {
    return this.prisma.taxProfile.findUnique({
      where: { customerId },
    });
  }
}
