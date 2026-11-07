import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async getDashboardMetrics() {
    const totalClients = await this.prisma.customer.count({ where: { role: 'CLIENT' } });
    const activeDisputes = await this.prisma.dispute.count({ where: { status: 'PENDING' } });
    const totalDocs = await this.prisma.document.count();
    return { totalClients, activeDisputes, totalDocs };
  }

  async listAllCustomers() {
    return this.prisma.customer.findMany({
      select: { id: true, email: true, name: true, status: true, createdAt: true, role: true, services: true },
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
    
    // Ahora usamos el método wrapper que creamos en SupabaseService
    const url = await this.supabase.getSignedUrl('documents', doc.storagePath);
    
    // Retornamos el mismo formato que esperaba el frontend
    return { url, expiresIn: 86400, fileName: doc.fileName };
  }
}
