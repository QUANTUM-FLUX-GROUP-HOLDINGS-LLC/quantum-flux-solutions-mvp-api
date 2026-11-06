import { Module } from '@nestjs/common';
import { TaxBusinessController } from './tax-business.controller';
import { TaxBusinessService } from './tax-business.service';

@Module({
  controllers: [TaxBusinessController],
  providers: [TaxBusinessService],
})
export class TaxBusinessModule {}
