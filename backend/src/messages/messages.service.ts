import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

/** Input built by the controller: sender always comes from the session token. */
export interface CreateMessageInput {
  senderId: string;
  receiverId: string;
  content: string;
}
/** Shape delivered to SSE subscribers (mirrors the Prisma Message model). */
export interface MessageEventPayload {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | string;
}

@Injectable()
export class MessagesService {
  /** Live SSE subscribers keyed by numeric id. */
  private subscribers = new Map<number, { selfId: string; emit: (m: MessageEventPayload) => void }>();
  private nextSubscriberId = 1;

  constructor(private prisma: PrismaService) {}

  /** Registers a listener; returns its unsubscribe function. */
  subscribe(selfId: string, emit: (m: MessageEventPayload) => void) {
    const id = this.nextSubscriberId++;
    this.subscribers.set(id, { selfId, emit });
    return () => this.subscribers.delete(id);
  }

  private publish(message: MessageEventPayload) {
    for (const { selfId, emit } of this.subscribers.values()) {
      if (message.senderId === selfId || message.receiverId === selfId) emit(message);
    }
  }

  async create(input: CreateMessageInput) {
    // Fields are mapped explicitly so Prisma resolves the unchecked
    // create input variant instead of inferring against the DTO class.
    const message = await this.prisma.message.create({
      data: {
        senderId: input.senderId,
        receiverId: input.receiverId,
        content: input.content,
      },
    });
    // Notify live SSE subscribers of both participants.
    this.publish(message);
    return message;
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
