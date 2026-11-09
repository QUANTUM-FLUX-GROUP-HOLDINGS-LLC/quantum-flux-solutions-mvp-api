import {
  Body, Controller, Delete, Get, Param, Post, Req, Query, UploadedFile,
  UseGuards, UseInterceptors, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { DocumentCategory } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { 
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } 
  }))
  async upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: DocumentCategory,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const customerId = req.user.id || req.user.sub || req.user.userId;
    if (!customerId) throw new BadRequestException('No user ID in token');

    try {
      return await this.documents.upload(customerId, file, category);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error processing file');
    }
  }

  @Get()
  list(@Req() req: any, @Query('category') category?: DocumentCategory) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.documents.listForCustomer(customerId, category);
  }

  @Get(':id/download')
  download(@Req() req: any, @Param('id') id: string) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.documents.createSignedUrl(customerId, id);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const selfId = req.user.id || req.user.sub || req.user.userId;
    await this.documents.remove(id, selfId, req.user.role);
    return { deleted: true };
  }
}
