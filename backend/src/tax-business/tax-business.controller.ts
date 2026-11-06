import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { TaxBusinessService } from './tax-business.service';
import PDFDocument from 'pdfkit';

@Controller('tax-business')
export class TaxBusinessController {
  constructor(private readonly taxBusinessService: TaxBusinessService) {}

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const profile = await this.taxBusinessService.findOne(id);
    
    if (!profile) {
      return res.status(404).send('Profile not found');
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tax-profile-${id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Quantum Flux Solutions', { align: 'center' });
    doc.fontSize(14).text('Business Tax Profile Summary', { align: 'center' });
    doc.moveDown();

    // Body
    doc.fontSize(12).text(`Entity Name: ${profile.entityName || 'N/A'}`);
    doc.text(`EIN: ${profile.ein || 'N/A'}`);
    doc.text(`Entity Type: ${profile.entityType || 'N/A'}`);
    doc.text(`Gross Revenue: $${profile.grossRevenue || 0}`);
    doc.text(`Employees: ${profile.employees || 0}`);
    doc.moveDown();
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`);

    doc.end();
  }
}
