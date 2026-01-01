import { patientTable } from '@src/db/users';
import { pgTable, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const cartTable = pgTable('cart', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  patientId: uuid('patient_id')
    .references(() => patientTable.userId, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  items: jsonb('items')
    .$type<
      {
        medicationId?: string;
        quantity?: number;
      }[]
    >()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type cartTableInsertType = typeof cartTable.$inferInsert;
export type cartTableSelectType = typeof cartTable.$inferSelect;
