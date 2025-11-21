import {
    pgTable,
    text,
    timestamp,
    uuid,
    doublePrecision
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';
import { bookingTable } from '@src/db/booking';


export const paymentTable = pgTable('payments', {
    id: uuid().defaultRandom().primaryKey().notNull(),
    patientId: uuid('patientId')
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    consultantId: uuid('consultantId')
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    invoiceId: text('invoice_id'),
    reference: text('reference'),
    bookingId: uuid('bookingId').notNull().references(() => bookingTable.id, { onDelete: "cascade" }),
    dateInitiated: text('date_initiated'),
    amount: doublePrecision('amount').notNull(),
    paymentMethod: text('payment_method').notNull(),
    paymentStatus: text('payment_status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type paymentInsertType = typeof paymentTable.$inferInsert;
export type paymentSelectType = typeof paymentTable.$inferSelect;
