import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { StreamTicketsController } from './stream-tickets.controller';
import { SseTicketsService } from './sse-tickets.service';
import { SseAuthGuard } from './sse-auth.guard';

@Module({
  providers: [MessagesService, SseTicketsService, SseAuthGuard],
  controllers: [MessagesController, StreamTicketsController]
})
export class MessagesModule {}
