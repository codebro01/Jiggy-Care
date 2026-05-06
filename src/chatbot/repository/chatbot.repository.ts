import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, eq } from 'drizzle-orm';
import { chatbotMessageTable, ChatbotMessageInsertType } from '@src/db';

@Injectable()
export class ChatbotRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async saveMessage(data: ChatbotMessageInsertType) {
    await this.DbProvider.insert(chatbotMessageTable).values(data);
  }

  async getSessionMessages(sessionId: string) {
    const sessionMessages = await this.DbProvider.select()
      .from(chatbotMessageTable)
      .where(eq(chatbotMessageTable.sessionId, sessionId))
      .orderBy(asc(chatbotMessageTable.createdAt));

      console.log('sessionmessages', sessionMessages)

      return sessionMessages;
  }

  async getPatientSessions(patientId: string) {
    return this.DbProvider.selectDistinct({
      sessionId: chatbotMessageTable.sessionId,
      createdAt: chatbotMessageTable.createdAt,
    })
      .from(chatbotMessageTable)
      .where(eq(chatbotMessageTable.patientId, patientId))
      .orderBy(asc(chatbotMessageTable.createdAt));
  }
}
