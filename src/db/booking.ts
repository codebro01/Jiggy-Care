import { pgTable, uuid, timestamp, text, index, boolean, integer } from "drizzle-orm/pg-core";
import { userTable } from "./users";
import { InferSelectModel } from "drizzle-orm";

;


export const bookingTable = pgTable('bookings', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    consultantId: uuid('consultantId').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    patientId: uuid('patientId').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    date: timestamp('date', { withTimezone: true, mode: 'date' }).notNull(),
    duration: integer('duration').default(1), 
    symptoms: text('symptoms').array(),
    paymentStatus: boolean('payment_status').default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
    index('consultantId_idx').on(table.consultantId),
    index('patientId_idx').on(table.patientId),
    index('bookingDate_idx').on(table.date)
],
);

export type selectBookingType = InferSelectModel<typeof bookingTable>