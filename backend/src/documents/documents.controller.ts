import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { DocumentCategory } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: DocumentCategory,
  ) {
    return this.documents.upload(req.user.sub, file, category);
  }

  @Get()
  list(@Req() req: any) {
    return this.documents.listForCustomer(req.user.sub);
  }

  @Get(':id/download')
  download(@Req() req: any, @Param('id') id: string) {
    return this.documents.createSignedUrl(req.user.sub, id);
  }
}
