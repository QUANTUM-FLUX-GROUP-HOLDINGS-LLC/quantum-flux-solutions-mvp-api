import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming you have this

@Controller('messages')
// @UseGuards(JwtAuthGuard) // Uncomment if you have AuthGuard ready
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
}
