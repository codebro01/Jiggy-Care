import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { userTable } from './users';

export const medicationTable = pgTable('medications', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  gram: integer('gram').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  rating: doublePrecision('rating').default(0),
  stockStatus: varchar('stock_status', { length: 50 })
    .notNull()
    .default('in_stock'),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const medicationRequestTable = pgTable('medications_request', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  gram: integer('gram'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type MedicationSelectType = typeof medicationTable.$inferSelect;
export type MedicationRequestInsertType = typeof medicationRequestTable.$inferInsert;

