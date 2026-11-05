import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, data: { bureau: string, accountName: string, accountNumber?: string }) {
    return this.prisma.dispute.create({
      data: { ...data, customerId },
    });
  }

  async findAll(customerId: string) {
    return this.prisma.dispute.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, customerId: string, status: string) {
    const dispute = await this.prisma.dispute.findFirst({ where: { id, customerId } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    
    return this.prisma.dispute.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, customerId: string) {
    const dispute = await this.prisma.dispute.findFirst({ where: { id, customerId } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return this.prisma.dispute.delete({ where: { id } });
  }

  async generatePdf(disputeId: string, customerId: string) {
    const dispute = await this.prisma.dispute.findFirst({
      where: { id: disputeId, customerId },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // Crear documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Tamaño Carta (Letter)
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const { width, height } = page.getSize();
    const fontSize = 12;
    let y = height - 50;

    // Direcciones de las agencias
    const bureaus: Record<string, string> = {
      'Equifax': 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
      'Experian': 'Experian\nP.O. Box 4500\nAllen, TX 75013',
      'TransUnion': 'TransUnion Consumer Solutions\nP.O. Box 2000\nChester, PA 19016'
    };

    // Encabezado (Fecha y Datos del Cliente)
    page.drawText(new Date().toLocaleDateString('en-US'), { x: 50, y, size: fontSize, font });
    y -= 20;
    page.drawText(customer.name, { x: 50, y, size: fontSize, font });
    page.drawText(customer.email, { x: 50, y: y - 15, size: fontSize, font });
    y -= 60;

    // Datos de la Agencia
    const bureauAddress = bureaus[dispute.bureau] || 'Credit Bureau';
    const addressLines = bureauAddress.split('\n');
    for (const line of addressLines) {
      page.drawText(line, { x: 50, y, size: fontSize, font });
      y -= 15;
    }
    y -= 30;

    // Asunto
    page.drawText(`RE: Formal Notice of Dispute - Account: ${dispute.accountName}`, { x: 50, y, size: fontSize, font: fontBold });
    y -= 30;

    // Cuerpo de la carta
    const bodyText = [
      `To Whom It May Concern,`,
      ``,
      `I am writing to dispute the following information in my file. The items I dispute also are encircled on the attached copy of the report I received.`,
      ``,
      `Account Name: ${dispute.accountName}`,
      `Account Number: ${dispute.accountNumber || 'N/A'}`,
      ``,
      `This item is inaccurate because it does not belong to me, or the information is incorrect. I am requesting that you investigate this matter and remove the inaccurate information from my credit report.`,
      ``,
      `I have attached copies of my identification and proof of my current address. Please investigate this matter and correct the disputed items as soon as possible.`,
      ``,
      `Sincerely,`,
      ``,
      ``,
      customer.name
    ];

    for (const line of bodyText) {
      page.drawText(line, { x: 50, y, size: fontSize, font });
      y -= 15;
    }

    // Guardar el PDF como bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
