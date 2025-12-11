import { userTable } from '@src/db/users';
import { jsonb } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { uuid, timestamp, pgEnum} from 'drizzle-orm/pg-core';

export const healthReadingType = pgEnum('health_reading_type', ['blood_pressure', 'heart_rate', 'temperature', 'weight']);

export enum readingStatusType {
    NORMAL = 'normal', 
    ATTENTION_REQUIRED = 'attention_required'
}

export const healthMonitoringTable = pgTable('health_monitoring', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  patientId: uuid('patientId')
    .references(() => userTable.id)
    .notNull(),
  temperature: jsonb('temperature').$type<{
    value: number;
    status?: readingStatusType, 
    note?: string;

  }>(),
  heartRate: jsonb('heart_rate').$type<{
    value: number;
    status?: readingStatusType, 
    note?: string;
  }>(),
  weight: jsonb('weight').$type<{
    value: number;
    status?: readingStatusType, 
    note?: string;
  }>(),
  bloodPressure: jsonb('blood_pressure').$type<{
    systolic: number;
    diastolic: number;
    status?: readingStatusType, 
    note?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type healthMonitoringTableInsertType =
  typeof healthMonitoringTable.$inferInsert;
export type healthMonitoringTableSelectType =
  typeof healthMonitoringTable.$inferSelect;
