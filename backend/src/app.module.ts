import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { DocumentsModule } from './documents/documents.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { CreditModule } from './credit/credit.module';
import { TaxModule } from './tax/tax.module';
import { TaxBusinessModule } from './tax-business/tax-business.module';
import { BookkeepingModule } from './bookkeeping/bookkeeping.module';
import { StripeModule } from './integrations/stripe/stripe.module';
import { MessagesModule } from './messages/messages.module';
import { LettersModule } from './letters/letters.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StorageModule,
    DocumentsModule,
    AdminModule,
    MailModule,
    CreditModule,
    TaxModule,
    TaxBusinessModule,
    BookkeepingModule,
    StripeModule,
    MessagesModule,
    LettersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
