import { labTable } from "@src/db/lab";
import { consultantTable, patientTable } from "@src/db/users";
import { pgTable, uuid, varchar, timestamp, jsonb} from "drizzle-orm/pg-core";


export const testResultTable = pgTable('test_results', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  consultantId: uuid('consultant_id')
    .references(() => consultantTable.userId, { onDelete: 'cascade' })
    .notNull(),
  patientId: uuid('patient_id')
    .references(() => patientTable.userId, { onDelete: 'cascade' })
    .notNull(),
  labId: uuid('lab_id')
    .references(() => labTable.id, { onDelete: 'cascade' }),

  title: varchar('title', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  testValues: jsonb('test_values').notNull(), 
  status: varchar('status').default('normal').notNull(), 
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type testResultTableInsertType = typeof testResultTable.$inferInsert;
export type testResultTableSelectType = typeof testResultTable.$inferSelect;