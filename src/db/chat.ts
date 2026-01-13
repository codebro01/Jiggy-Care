import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { consultantTable, patientTable } from '@src/db/users';
import { bookingTable } from '@src/db/booking';

export const conversationsTable = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    consultantId: uuid('consultant_id')
      .notNull()
      .references(() => consultantTable.userId, { onDelete: 'cascade' }).notNull(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patientTable.userId, { onDelete: 'cascade' }),
    bookingId: uuid('booking_id').references(() => bookingTable.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    consultantPatientIdx: index('consultant_patient_idx').on(
      table.consultantId,
      table.patientId,
    ),
  }),
);

export const messagesTable = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationsTable.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id').notNull(),
    senderType: text('sender_type').notNull(), // 'consultant' or 'patient'
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index('conversation_idx').on(table.conversationId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  }),
);

// Relations
export const consultantsRelations = relations(consultantTable, ({ many }) => ({
  conversations: many(conversationsTable),
}));

export const patientsRelations = relations(patientTable, ({ many }) => ({
  conversations: many(conversationsTable),
}));

export const conversationsRelations = relations(conversationsTable, ({ one, many }) => ({
  consultant: one(consultantTable, {
    fields: [conversationsTable.consultantId],
    references: [consultantTable.userId],
  }),
  patient: one(patientTable, {
    fields: [conversationsTable.patientId],
    references: [patientTable.userId],
  }),
  messages: many(messagesTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  conversation: one(conversationsTable, {
    fields: [messagesTable.conversationId],
    references: [conversationsTable.id],
  }),
}));
