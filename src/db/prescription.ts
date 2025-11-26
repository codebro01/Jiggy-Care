import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';
import { userTable } from './users';
import { pgEnum } from 'drizzle-orm/pg-core';

export const frequencyType = pgEnum('dosage_type', [
  'once_daily',
  'twice_daily',
  'thrice_daily',
  'four_times_daily',
  'five_times_daily',
  'often',
]);

export const prescriptionTable = pgTable('prescriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patientId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  consultantId: uuid('consultantId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }).notNull(),
  frequency: frequencyType('frequency').notNull(),
  pillsRemaining: integer('pills_remaining').notNull(),
  totalPills: integer('total_pills').notNull(),
  startDate: date('start_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SelectPrescriptionType = typeof prescriptionTable.$inferSelect;
