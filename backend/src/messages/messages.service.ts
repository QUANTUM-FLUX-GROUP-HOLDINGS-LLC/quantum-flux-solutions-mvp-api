import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    return this.prisma.message.create({
      data: createMessageDto,
    });
  }

  async findConversation(user1Id: string, user2Id: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findSupportAgent() {
    // Finds the first ADMIN user in the DB to act as the support agent
    return this.prisma.customer.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, name: true },
    });
  }
}
