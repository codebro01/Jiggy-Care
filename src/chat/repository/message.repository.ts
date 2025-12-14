// src/repositories/message.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, sql } from 'drizzle-orm';
import { messagesTable } from '@src/db';


export interface CreateMessageDto {
  conversationId: string;
  senderId: string;
  senderType: 'consultant' | 'patient';
  content: string;
}

@Injectable()
export class MessageRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async create(data: CreateMessageDto) {
    const result = await this.DbProvider.insert(messagesTable)
      .values(data)
      .returning();

    return result[0];
  }

  async findByConversation(conversationId: string, limit = 50, offset = 0) {
    return await this.DbProvider.select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markAsRead(messageIds: string[]) {
    if (messageIds.length === 0) return [];

    // Use IN clause for multiple IDs
    return await this.DbProvider
      .update(messagesTable)
      .set({ isRead: true })
      .where(
        messageIds.length === 1
          ? eq(messagesTable.id, messageIds[0])
          : sql`${messagesTable.id} = ANY(${messageIds})`,
      )
      .returning();
  }

  async countUnread(conversationId: string, excludeSenderId: string) {
    const result = await this.DbProvider.select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.conversationId, conversationId),
          eq(messagesTable.isRead, false),
        ),
      );

    return result.filter((msg) => msg.senderId !== excludeSenderId).length;
  }
}
