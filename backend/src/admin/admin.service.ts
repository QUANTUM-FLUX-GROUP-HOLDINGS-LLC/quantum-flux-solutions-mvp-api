import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { SupabaseService } from '../storage/supabase.service';

// Fields safe to return to the client (password hash must never leak).
const CLIENT_SELECT = {
  id: true, email: true, name: true, status: true, createdAt: true, role: true, services: true,
};

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
    return this.prisma.customer.findMany({ select: CLIENT_SELECT });
  }

  async createClient(data: { name: string; email: string }) {
    const existing = await this.prisma.customer.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already in use');

    // No password: the client can gain access via the forgot-password flow.
    return this.prisma.customer.create({
      data: { name: data.name, email: data.email, role: 'CLIENT' },
      select: CLIENT_SELECT,
    });
  }

  async updateClient(id: string, data: { name?: string; email?: string }) {
    const client = await this.prisma.customer.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');

    try {
      return await this.prisma.customer.update({ where: { id }, data, select: CLIENT_SELECT });
    } catch (error) {
      // Prisma P2002 = unique constraint violation (email already taken).
      if ((error as { code?: string })?.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async deleteClient(id: string) {
    const client = await this.prisma.customer.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');

    // Message relations default to Restrict (no onDelete in the schema),
    // so they must be removed explicitly. Everything else (disputes,
    // profiles, documents rows) cascades with the customer delete.
    // TODO: physical files in Supabase Storage are NOT removed by this
    // operation — a storage cleanup job should sweep orphaned objects later.
    const [, deleted] = await this.prisma.$transaction([
      this.prisma.message.deleteMany({
        where: { OR: [{ senderId: id }, { receiverId: id }] },
      }),
      this.prisma.customer.delete({ where: { id } }),
    ]);

    return { success: true, deletedId: deleted.id };
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

    const url = await this.supabase.getSignedUrl('documents', doc.storagePath);

    return { url, expiresIn: 86400, fileName: doc.fileName };
  }
}
