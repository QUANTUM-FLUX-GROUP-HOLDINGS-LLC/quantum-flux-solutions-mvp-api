import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Res } from '@nestjs/common';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Response } from 'express';

@Controller('credit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreditController {
  constructor(private readonly credit: CreditService) {}

  // --- Admin / credit agent routes ---

  @Get('disputes')
  @Roles('ADMIN', 'CREDIT_REPAIR')
  listAllDisputes() {
    return this.credit.listDisputes();
  }

  @Get('customers/:id/disputes')
  @Roles('ADMIN', 'CREDIT_REPAIR')
  getClientDisputes(@Param('id') id: string) {
    return this.credit.getClientDisputes(id);
  }

  @Post('customers/:id/disputes')
  @Roles('ADMIN', 'CREDIT_REPAIR')
  createDisputeForCustomer(@Param('id') id: string, @Body() body: any) {
    return this.credit.createDispute(id, body);
  }

  @Patch('disputes/:id')
  @Roles('ADMIN', 'CREDIT_REPAIR')
  updateDispute(@Param('id') id: string, @Body('status') status: string) {
    return this.credit.updateDisputeStatus(id, status);
  }

  // --- Client routes (view disputes, download PDF) ---

  @Get('my-disputes')
  @Roles('CLIENT')
  listMyDisputes(@Req() req: any) {
    const customerId = req.user.id || req.user.sub || req.user.userId;
    return this.credit.listMyDisputes(customerId);
  }

  @Get('my-disputes/:id/pdf')
  @Roles('CLIENT')
  async downloadPdf(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
    const customerId = req.user.id;
    const pdfBuffer = await this.credit.generatePdf(id, customerId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Dispute_Letter_${id}.pdf"`,
    });
    res.end(pdfBuffer);
  }
}
