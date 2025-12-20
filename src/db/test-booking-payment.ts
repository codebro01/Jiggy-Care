import {
    pgTable,
    text,
    timestamp,
    uuid,
    doublePrecision
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';
import { testBookingTable } from '@src/db/test-bookings';


export const testBookingPaymentTable = pgTable('test_booking_payment', {
    id: uuid().defaultRandom().primaryKey().notNull(),
    testBookingId: uuid('testBookingId')
        .notNull()
        .references(() => testBookingTable.id, { onDelete: 'cascade' }),
    patientId: uuid('patientId')
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    invoiceId: text('invoice_id'),
    reference: text('reference'),
    dateInitiated: text('date_initiated'),
    amount: doublePrecision('amount').notNull(),
    paymentMethod: text('payment_method').notNull(),
    paymentStatus: text('payment_status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type testBookingPaymentInsertType = typeof testBookingPaymentTable.$inferInsert;
export type testBookingPaymentSelectType = typeof testBookingPaymentTable.$inferSelect;
