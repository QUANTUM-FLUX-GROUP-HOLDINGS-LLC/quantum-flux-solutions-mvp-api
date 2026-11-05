import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StripeModule } from './integrations/stripe/stripe.module';
import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { DocumentsModule } from './documents/documents.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    StripeModule,
    PrismaModule,
    AuthModule,
    StorageModule,
    DocumentsModule,
    AdminModule,
    MailModule, // <-- Aquí está de vuelta
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
