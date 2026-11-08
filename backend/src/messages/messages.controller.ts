import { Controller, Get, Post, Body, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
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
  getConversation(@Req() req: any, @Query('user1') user1: string, @Query('user2') user2: string) {
    const selfId = req.user.id || req.user.sub || req.user.userId;
    if (user1 !== selfId && user2 !== selfId) {
      // Users may only read conversations they participate in.
      throw new ForbiddenException('You can only access your own conversations.');
    }
    return this.messagesService.findConversation(user1, user2);
  }

  @Get('support-agent')
  getSupportAgent() {
    return this.messagesService.findSupportAgent();
  }
}
