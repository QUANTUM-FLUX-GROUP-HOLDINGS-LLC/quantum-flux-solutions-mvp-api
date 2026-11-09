import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class LettersService {
  constructor(private readonly prisma: PrismaService) {}

  // Letter templates are seeded by hand (see seed script) and edited by
  // staff; creation/deletion stays out of the API surface for now.
  list() {
    return this.prisma.letterTemplate.findMany({
      orderBy: { bureau: 'asc' },
    });
  }

  async updateContent(id: string, content: string) {
    const template = await this.prisma.letterTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Letter template not found');
    return this.prisma.letterTemplate.update({
      where: { id },
      data: { content },
    });
  }
}
