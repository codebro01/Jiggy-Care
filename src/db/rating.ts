import {
  pgTable,
  text,
  doublePrecision,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db';
import { InferSelectModel } from 'drizzle-orm';

export const ratingTable = pgTable('ratings', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  consultantId: uuid('consultantId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  patientId: uuid('patientId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  rating: doublePrecision('rating').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ratingSelectType = InferSelectModel<typeof ratingTable>;
