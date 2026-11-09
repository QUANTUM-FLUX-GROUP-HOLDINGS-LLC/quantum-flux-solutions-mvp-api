import { Controller, Get, Post, Body, Query, Req, UseGuards, ForbiddenException, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseAuthGuard } from './sse-auth.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() dto: CreateMessageDto) {
    // Sender is derived from the session token. Any senderId present in
    // the body is deliberately ignored to prevent impersonation.
    const senderId = req.user.id || req.user.sub || req.user.userId;
    return this.messagesService.create({
      senderId,
      receiverId: dto.receiverId,
      content: dto.content,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getConversation(@Req() req: any, @Query('user1') user1: string, @Query('user2') user2: string) {
    const selfId = req.user.id || req.user.sub || req.user.userId;
    if (user1 !== selfId && user2 !== selfId) {
      // Users may only read conversations they participate in.
      throw new ForbiddenException('You can only access your own conversations.');
    }
    return this.messagesService.findConversation(user1, user2);
  }

  @Get('support-agent')
  @UseGuards(JwtAuthGuard)
  getSupportAgent() {
    return this.messagesService.findSupportAgent();
  }

  @Sse('stream')
  @UseGuards(SseAuthGuard)
  stream(@Req() req: any): Observable<MessageEvent> {
    const selfId = req.user.id || req.user.sub || req.user.userId;
    return new Observable((observer) => {
      const unsubscribe = this.messagesService.subscribe(selfId, (msg) =>
        observer.next({ data: msg }),
      );
      // Keep-alive frame so proxies do not drop idle connections.
      const ping = setInterval(() => observer.next({ data: { type: 'ping' } }), 25000);
      return () => {
        clearInterval(ping);
        unsubscribe();
      };
    });
  }
}
