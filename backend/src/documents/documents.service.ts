import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../core/database/prisma.service';
import { SupabaseService } from '../storage/supabase.service';
import { DocumentCategory } from '@prisma/client';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(['application/pdf', 'image/png', 'image/jpeg']);

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async upload(
    customerId: string,
    file: Express.Multer.File,
    category: DocumentCategory = DocumentCategory.CREDIT_REPORT,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_BYTES) throw new BadRequestException('File exceeds 10MB');
    if (!ALLOWED.has(file.mimetype)) throw new BadRequestException('Unsupported file type');

    const ext = extname(file.originalname) || '.pdf';
    const key = `${customerId}/${randomUUID()}${ext}`;

    const { error } = await this.supabase.storage.upload(key, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw new InternalServerErrorException(`Upload failed: ${error.message}`);

    const doc = await this.prisma.document.create({
      data: {
        customerId,
        fileName: file.originalname,
        storagePath: key,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        category,
      },
    });
    return this.toDto(doc);
  }

  async listForCustomer(customerId: string) {
    const docs = await this.prisma.document.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
    return docs.map((d) => this.toDto(d));
  }

  async createSignedUrl(customerId: string, id: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, customerId } });
    if (!doc) throw new NotFoundException('Document not found');

    const { data, error } = await this.supabase.storage.createSignedUrl(doc.storagePath, 600);
    if (error) throw new InternalServerErrorException(error.message);

    return { url: data.signedUrl, expiresIn: 600, fileName: doc.fileName };
  }

  private toDto(d: any) {
    return {
      id: d.id,
      fileName: d.fileName,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      category: d.category,
      createdAt: d.createdAt,
    };
  }
}
