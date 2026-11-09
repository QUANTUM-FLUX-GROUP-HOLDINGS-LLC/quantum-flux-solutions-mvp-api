import { Injectable, NotFoundException,
  ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { MailService } from '../mail/mail.service';
import { PDFDocument, StandardFonts } from 'pdf-lib';

// Canonical dispute lifecycle: PENDING -> SENT -> RESOLVED.
// Any other stored value is legacy garbage (e.g. APPROVED) and must be
// treated as invalid going forward.
const DISPUTE_STATUSES = ['PENDING', 'SENT', 'RESOLVED'] as const;

@Injectable()
export class CreditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async listDisputes() {
    return this.prisma.dispute.findMany({
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClientDisputes(customerId: string) {
    return this.prisma.dispute.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDispute(customerId: string, data: { bureau: string, accountName: string, accountNumber?: string }) {
    return this.prisma.dispute.create({
      data: { ...data, customerId, status: 'PENDING' },
    });
  }

  async updateDisputeStatus(id: string, status: string) {
    if (!DISPUTE_STATUSES.includes(status as any)) {
      throw new BadRequestException(
        `Invalid dispute status "${status}". Allowed: ${DISPUTE_STATUSES.join(', ')}.`,
      );
    }
    // Transitions: PENDING -> SENT -> RESOLVED. Never back to PENDING.
    const FORWARD: Record<string, string[]> = {
      PENDING: ['SENT', 'RESOLVED'],
      SENT: ['RESOLVED'],
      RESOLVED: [],
    };
    const dispute = await this.prisma.dispute.findUnique({ 
      where: { id },
      include: { customer: true }
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    if (!FORWARD[dispute.status]?.includes(status)) {
      throw new ConflictException(
        `Cannot move dispute from ${dispute.status} to ${status}.`,
      );
    }

    const updated = await this.prisma.dispute.update({ where: { id }, data: { status } });
    
    // Enviar correo al cliente si cambia el estado
    if (dispute.customer?.email) {
      await this.mail.sendDisputeStatusUpdate(
        dispute.customer.email, 
        dispute.customer.name, 
        dispute.accountName, 
        status
      );
    }
    return updated;
  }

  async listMyDisputes(customerId: string) {
    return this.prisma.dispute.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, bureau: true, accountName: true, accountNumber: true,
        status: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async generatePdf(disputeId: string, customerId: string) {
    const dispute = await this.prisma.dispute.findFirst({
      where: { id: disputeId, customerId },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    if (dispute.status === 'PENDING') {
      throw new ConflictException('This dispute is pending admin review. You cannot download the letter yet.');
    }

    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const { height } = page.getSize();
    let y = height - 50;

    const bureaus: Record<string, string> = {
      'Equifax': 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
      'Experian': 'Experian\nP.O. Box 4500\nAllen, TX 75013',
      'TransUnion': 'TransUnion Consumer Solutions\nP.O. Box 2000\nChester, PA 19016'
    };

    page.drawText(new Date().toLocaleDateString('en-US'), { x: 50, y, size: 12, font });
    y -= 20;
    page.drawText(customer.name, { x: 50, y, size: 12, font });
    page.drawText(customer.email, { x: 50, y: y - 15, size: 12, font });
    y -= 60;

    for (const line of (bureaus[dispute.bureau] || 'Credit Bureau').split('\n')) {
      page.drawText(line, { x: 50, y, size: 12, font });
      y -= 15;
    }
    y -= 30;

    page.drawText(`RE: Formal Notice of Dispute - Account: ${dispute.accountName}`, { x: 50, y, size: 12, font: fontBold });
    y -= 30;

    const bodyText = [
      `To Whom It May Concern,`, ``,
      `I am writing to dispute the following information in my file.`,
      `Account Name: ${dispute.accountName}`,
      `Account Number: ${dispute.accountNumber || 'N/A'}`, ``,
      `This item is inaccurate. I am requesting that you investigate this matter and remove the inaccurate information.`, ``,
      `Sincerely,`, ``, ``, customer.name
    ];

    for (const line of bodyText) {
      page.drawText(line, { x: 50, y, size: 12, font });
      y -= 15;
    }

    y = 80;
    page.drawText('DISCLAIMER: This document was generated by Quantum Flux Solutions.', { x: 50, y, size: 8, font: fontItalic });
    page.drawText('We are not a law firm and do not provide legal advice.', { x: 50, y: y - 10, size: 8, font: fontItalic });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
