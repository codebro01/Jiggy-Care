// support.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { supportConversationsTable, supportMessagesTable } from '@src/db';
import { eq } from 'drizzle-orm';
import { agentStatus } from '@src/db/support';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class SupportRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createConversation(patientId: string) {
    console.log('patientid', patientId)
    const [conversation] = await this.DbProvider.insert(
      supportConversationsTable,
    )
      .values({
        patientId,
        status: agentStatus.WAITING,
      })
      .returning();

    return conversation;
  }

  async assignAgent(conversationId: string, agentId: string) {
    const [conversation] = await this.DbProvider.update(
      supportConversationsTable,
    )
      .set({
        agentId,
        status: agentStatus.ACTIVE,
        updatedAt: new Date(),
      })
      .where(eq(supportConversationsTable.id, conversationId))
      .returning();

    return conversation;
  }

  async closeConversation(conversationId: string) {
    await this.DbProvider.update(supportConversationsTable)
      .set({
        status: agentStatus.CLOSED,
        updatedAt: new Date(),
      })
      .where(eq(supportConversationsTable.id, conversationId));
  }

  async findWaitingConversation() {
    return this.DbProvider.query.supportConversationsTable.findFirst({
      where: eq(supportConversationsTable.status, agentStatus.WAITING),
      orderBy: (t, { asc }) => asc(t.createdAt),
    });
  }

  async getConversation(conversationId: string) {
    return this.DbProvider.query.supportConversationsTable.findFirst({
      where: eq(supportConversationsTable.id, conversationId),
    });
  }

  async saveMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: 'agent' | 'patient';
    content: string;
  }) {
    const [message] = await this.DbProvider.insert(supportMessagesTable)
      .values(data)
      .returning();

    return message;
  }

  async getMessages(conversationId: string) {
    return this.DbProvider.query.supportMessagesTable.findMany({
      where: eq(supportMessagesTable.conversationId, conversationId),
      orderBy: (t, { asc }) => asc(t.createdAt),
    });
  }
}
