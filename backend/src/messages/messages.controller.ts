import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  getConversation(@Query('user1') user1: string, @Query('user2') user2: string) {
    return this.messagesService.findConversation(user1, user2);
  }

  @Get('support-agent')
  getSupportAgent() {
    return this.messagesService.findSupportAgent();
  }
}
