import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // OPCIÓN A: Dashboard de Métricas
  async getDashboardMetrics() {
    const totalClients = await this.prisma.customer.count({ where: { role: 'CLIENT' } });
    const activeDisputes = await this.prisma.dispute.count({ where: { status: 'PENDING' } });
    const totalDocs = await this.prisma.document.count();
    return { totalClients, activeDisputes, totalDocs };
  }

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
    // ... (mantener lógica de supabase)
    return { url: 'mock_url', expiresIn: 600, fileName: doc.fileName };
  }

  async listAllDisputes() {
    return this.prisma.dispute.findMany({
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // OPCIÓN B: Actualizar estado y enviar correo
  async updateDisputeStatus(id: string, status: string) {
    const dispute = await this.prisma.dispute.findUnique({ 
      where: { id },
      include: { customer: true }
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    
    const updated = await this.prisma.dispute.update({ where: { id }, data: { status } });
    
    // Enviar correo al cliente
    if (dispute.customer?.email) {
      await this.mail.sendDisputeStatusUpdate(
        dispute.customer.email, 
        dispute.customer.name, 
        dispute.accountName, 
        status
      );
    }
    return updated;
  }

  async createDisputeForCustomer(customerId: string, data: any) {
    return this.prisma.dispute.create({
      data: { ...data, customerId, status: 'PENDING' },
    });
  }

  async getCustomerTaxProfile(customerId: string) {
    return this.prisma.taxProfile.findUnique({ where: { customerId } });
  }
}
