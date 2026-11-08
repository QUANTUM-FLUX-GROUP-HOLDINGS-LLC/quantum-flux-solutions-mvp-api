import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

/** Input built by the controller: sender always comes from the session token. */
export interface CreateMessageInput {
  senderId: string;
  receiverId: string;
  content: string;
}

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateMessageInput) {
    // Fields are mapped explicitly so Prisma resolves the unchecked
    // create input variant instead of inferring against the DTO class.
    return this.prisma.message.create({
      data: {
        senderId: input.senderId,
        receiverId: input.receiverId,
        content: input.content,
      },
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
