import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async listActiveCustomers() {
    // Buscamos a TODOS los clientes, sin importar el estatus
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
}
