import {
  pgTable,
  uuid,
  timestamp,
  text,
  index,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { consultantTable, userTable } from './users';
import { InferSelectModel } from 'drizzle-orm';

export const bookingStatusType = pgEnum('booking_status_type', [
  'completed',
  'upcoming',
  'in_progress',
  'cancelled',
  'no_show',
  'disputed',
  'pending_confirmation',
]);

export const bookingTable = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    consultantId: uuid('consultantId')
      .notNull()
      .references(() => consultantTable.userId, { onDelete: 'cascade' }),
    patientId: uuid('patientId')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    date: timestamp('date', { withTimezone: true, mode: 'date' }).notNull(),
    duration: integer('duration').default(1),
    symptoms: text('symptoms'),
    status: bookingStatusType('status').default('upcoming').notNull(),
    paymentStatus: boolean('payment_status').default(false),

    actualStart: timestamp('actual_start', { withTimezone: true }),
    actualEnd: timestamp('actual_end', { withTimezone: true }),
    consultantCompletedAt: timestamp('consultant_completed_at', {
      withTimezone: true,
    }),
    patientCompletedAt: timestamp('patient_completed_at', {
      withTimezone: true,
    }),

    consultantMarkedNoShow: boolean('consultant_marked_no_show').default(false),
    consultantConfirmed: boolean('consultant_confirmed').default(false),
    patientConfirmed: boolean('patient_confirmed').default(false),
    patientMarkedNoShow: boolean('patient_marked_no_show').default(false),

    consultationNotes: text('consultation_notes'),
    disputeReason: text('dispute_reason'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('consultantId_idx').on(table.consultantId),
    index('patientId_idx').on(table.patientId),
    index('bookingDate_idx').on(table.date),
  ],
);

export type bookingTableSelectType = InferSelectModel<typeof bookingTable>;
export type bookingTableInsertType = typeof bookingTable.$inferInsert;
