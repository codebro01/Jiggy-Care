import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { patientTable } from '@src/db/users';
import { agentTable } from '@src/db/agents';
import { varchar } from 'drizzle-orm/pg-core';

export enum agentStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export const supportConversationsTable = pgTable(
  'support_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id').references(() => agentTable.userId, {
      onDelete: 'cascade',
    }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patientTable.userId, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 })
      .$type<agentStatus>()
      .notNull()
      .default(agentStatus.WAITING),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    agentPatientIdx: index('agent_patient_idx').on(
      table.agentId,
      table.patientId,
    ),
  }),
);

export const supportMessagesTable = pgTable(
  'support_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => supportConversationsTable.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id').notNull(),
    senderType: text('sender_type').notNull(), // 'agent    ' or 'patient'
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index('support_conversation_idx').on(table.conversationId),
    createdAtIdx: index('support_created_at_idx').on(table.createdAt),
  }),
);

// Relations
export const agentRelations = relations(agentTable, ({ many }) => ({
  conversations: many(supportConversationsTable),
}));

export const supportPatientsRelations = relations(patientTable, ({ many }) => ({
  conversations: many(supportConversationsTable),
}));

export const supportConversationsRelations = relations(
  supportConversationsTable,
  ({ one, many }) => ({
    consultant: one(agentTable, {
      fields: [supportConversationsTable.agentId],
      references: [agentTable.userId],
    }),
    patient: one(patientTable, {
      fields: [supportConversationsTable.patientId],
      references: [patientTable.userId],
    }),
    messages: many(supportMessagesTable),
  }),
);

export const supportMessagesRelations = relations(
  supportMessagesTable,
  ({ one }) => ({
    conversation: one(supportConversationsTable, {
      fields: [supportMessagesTable.conversationId],
      references: [supportConversationsTable.id],
    }),
  }),
);
