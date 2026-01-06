import { labTable } from '@src/db/lab';
import { testTable } from '@src/db/test';
import { userTable } from '@src/db/users';
import { boolean } from 'drizzle-orm/pg-core';
import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  text,
} from 'drizzle-orm/pg-core';

export const testcollectionType = pgEnum('test_collection_type', [
  'home_collection',
  'visit_lab_centre',
]);

export const testBookingTable = pgTable('test_bookings', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  testId: uuid('testId')
    .references(() => testTable.id, { onDelete: 'cascade' })
    .notNull(),
  labId: uuid('labId').references(() => labTable.id, { onDelete: 'cascade' }),
  patientId: uuid('patientId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  completed: boolean('completed').default(false), 
  paymentStatus: text('payment_status').notNull().default('UNPAID'),
  collection: testcollectionType('collection').notNull(),
  date: timestamp('date', { withTimezone: true, mode: 'date' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type testBookingTableInsertType = typeof testBookingTable.$inferInsert;
export type testBookingsTableSelectType = typeof testBookingTable.$inferSelect;
