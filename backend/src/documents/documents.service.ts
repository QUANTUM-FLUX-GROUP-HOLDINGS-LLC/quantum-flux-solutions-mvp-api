import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { PrismaService } from '../core/database/prisma.service';
import { SupabaseService } from '../storage/supabase.service';
import { DocumentCategory } from '@prisma/client';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(['application/pdf', 'image/png', 'image/jpeg']);

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async upload(customerId: string, file: Express.Multer.File, category?: DocumentCategory) {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_BYTES) throw new BadRequestException('File exceeds 10MB');
    if (!ALLOWED.has(file.mimetype)) throw new BadRequestException('Unsupported file type');

    const fileExt = extname(file.originalname);
    const storagePath = `${customerId}/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;

    await this.supabase.uploadFile('documents', storagePath, file.buffer, file.mimetype);

    return this.prisma.document.create({
      data: {
        customerId,
        fileName: file.originalname,
        storagePath,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        category: category || DocumentCategory.CREDIT_REPORT,
      },
    });
  }

  async listForCustomer(customerId: string, category?: DocumentCategory) {
    return this.prisma.document.findMany({
      where: {
        customerId,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSignedUrl(customerId: string, documentId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, customerId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const url = await this.supabase.getSignedUrl('documents', doc.storagePath);
    return { url };
  }

  async remove(documentId: string, selfId: string, role: string) {
    const doc = role === 'ADMIN'
      ? await this.prisma.document.findUnique({ where: { id: documentId } })
      : await this.prisma.document.findFirst({ where: { id: documentId, customerId: selfId } });
    if (!doc) throw new NotFoundException('Document not found');

    // Row first, file second: a failed unlink leaves at most a stray file,
    // never a row pointing at nothing.
    await this.prisma.document.delete({ where: { id: doc.id } });
    try {
      await this.supabase.deleteFile('documents', doc.storagePath);
    } catch {
      // Best-effort: file may already be gone (ephemeral disk on Render).
    }
  }
}

