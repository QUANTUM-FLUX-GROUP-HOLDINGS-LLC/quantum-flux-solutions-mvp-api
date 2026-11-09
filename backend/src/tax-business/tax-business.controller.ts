import { Controller, Get, Post, Param, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { TaxBusinessService } from './tax-business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import PDFDocument from 'pdfkit';

// Staff-only module: business tax profiles contain EINs and revenue data.
@Controller('tax-business')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TAX_BUSINESS')
export class TaxBusinessController {
  constructor(private readonly taxBusinessService: TaxBusinessService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.taxBusinessService.findOne(id);
  }

  @Post(':id')
  async saveProfile(@Param('id') id: string, @Body() dto: UpdateBusinessProfileDto) {
    return this.taxBusinessService.upsertProfile(id, dto);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const profile = await this.taxBusinessService.findOne(id);

    if (!profile) {
      return res.status(404).send('Profile not found. Please save the profile first.');
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tax-profile-${id}.pdf`);

    doc.pipe(res);
    doc.fontSize(20).text('Quantum Flux Solutions', { align: 'center' });
    doc.fontSize(14).text('Business Tax Profile Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Entity Type: ${profile.entityType || 'N/A'}`);
    doc.text(`EIN: ${profile.ein || 'N/A'}`);
    doc.text(`Gross Revenue: $${profile.grossRevenue || 0}`);
    doc.text(`Has Employees: ${profile.hasEmployees ? 'Yes' : 'No'}`);
    doc.moveDown();
    if (profile.notes) {
      doc.text(`Notes: ${profile.notes}`);
      doc.moveDown();
    }
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.end();
  }
}
