import { readingStatusType } from "@src/db/health-monitoring";
import { labTable } from "@src/db/lab";
import { consultantTable, patientTable } from "@src/db/users";
import { pgTable, uuid, varchar, timestamp, jsonb} from "drizzle-orm/pg-core";


export const testResultTable = pgTable('test_results', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  consultantId: uuid('consultant_id')
    .references(() => consultantTable.userId, { onDelete: 'cascade' })
    .notNull(),
  patientId: uuid('consultant_id')
    .references(() => patientTable.userId, { onDelete: 'cascade' })
    .notNull(),
  labId: uuid('lab_id')
    .references(() => labTable.id, { onDelete: 'cascade' }),

  title: varchar('title', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  testValues: jsonb('test_values').$type<{
    hemoglobin?:{
        value: number, 
        range: string
        status: readingStatusType
    },
    hematrocit?:{
        value: number, 
        range: string
        status: readingStatusType
    },
    white_blood_cells?:{
        value: number, 
        range: string
        status: readingStatusType
    },
    platelets?:{
        value: number, 
        range: string
        status: readingStatusType
    },
  }>().notNull(), 
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type testResultTableInsertType = typeof testResultTable.$inferInsert;
export type testResultTableSelectType = typeof testResultTable.$inferSelect;