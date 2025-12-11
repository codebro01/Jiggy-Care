import { testTable } from "@src/db/test";
import { userTable } from "@src/db/users";
import { pgTable, uuid, timestamp, pgEnum, } from "drizzle-orm/pg-core";

export const testcollectionType = pgEnum('test_collection_type', ['home_collection', 'visit_lab_centre'])

export const testBookingsTable = pgTable('test_bookings', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  testId: uuid('testId').references(() => testTable.id, {onDelete: "cascade"}).notNull(),
  patientId: uuid('patientId').references(() => userTable.id, {onDelete: "cascade"}).notNull(),
  // category: varchar('category', {length: 255}).notNull(), 
  collection: testcollectionType('collection').notNull(),
  date: timestamp('date', { withTimezone: true, mode: 'date' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type testTableInsertType = typeof testBookingsTable.$inferInsert;
export type testBookingsTableSelectType = typeof testBookingsTable.$inferSelect;