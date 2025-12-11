import { pgTable, uuid, varchar, timestamp, text, integer, doublePrecision } from "drizzle-orm/pg-core";


export const testTable = pgTable('tests', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdBy: uuid('createdBy').notNull(),
  // category: varchar('category', {length: 255}).notNull(), 
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  preparation: text('preparation').notNull(),
  // collection: testcollectionType('collection').notNull(),
  durationInHrs: integer('duration_in_hrs').notNull(),
  amount: doublePrecision('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type testTableInsertType = typeof testTable.$inferInsert;
export type testTableSelectType = typeof testTable.$inferSelect;