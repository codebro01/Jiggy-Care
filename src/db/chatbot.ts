import { pgTable, uuid, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { userTable } from './users';
import { InferSelectModel } from 'drizzle-orm';

export const chatbotRoleEnum = pgEnum('chatbot_role', ['user', 'assistant']);

export const chatbotMessageTable = pgTable('chatbot_messages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  patientId: uuid('patientId')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  sessionId: uuid('sessionId').notNull(),
  role: chatbotRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type ChatbotMessageSelectType = InferSelectModel<
  typeof chatbotMessageTable
>;
export type ChatbotMessageInsertType = typeof chatbotMessageTable.$inferInsert;
