// src/repositories/conversation.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
import { conversationsTable } from '@src/db';
import { messagesTable } from '@src/db';


@Injectable()
export class ConversationRepository {
  constructor(@Inject("DB") private DbProvider: NodePgDatabase<typeof import('@src/db')>) {}

  async findByParticipants(bookingId: string, consultantId: string, patientId: string) {
    const result = await this.DbProvider
      .select()
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.consultantId, consultantId),
          eq(conversationsTable.patientId, patientId),
          eq(conversationsTable.bookingId, bookingId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async create(bookingId: string, consultantId: string, patientId: string) {
    console.log(bookingId)
    const result = await this.DbProvider
      .insert(conversationsTable)
      .values({bookingId,  consultantId, patientId })
      .returning();

    return result[0];
  }

  

  async findByConsultant(consultantId: string) {
    return await this.DbProvider.query.conversationsTable.findMany({
      where: eq(conversationsTable.consultantId, consultantId),
      with: {
        patient: true,
        messages: {
          orderBy: desc(messagesTable.createdAt),
          limit: 1,
        },
      },
    });
  }

  async findByPatient(patientId: string) {
    return await this.DbProvider.query.conversationsTable.findMany({
      where: eq(conversationsTable.patientId, patientId),
      with: {
        consultant: true,
        messages: {
          orderBy: desc(messagesTable.createdAt),
          limit: 1,
        },
      },
    });
  }

  async findById(id: string) {
    return await this.DbProvider.query.conversationsTable.findFirst({
      where: eq(conversationsTable.id, id),
      with: {
        consultant: true,
        patient: true,
      },
    });
  }
}

