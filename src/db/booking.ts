import { pgTable, uuid, timestamp, text, index, boolean } from "drizzle-orm/pg-core";
import { userTable } from "./users";

;


export const bookingTable = pgTable('bookings', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    consultantId: uuid('consultantId').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    patientId: uuid('patientId').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(),
    symptoms: text('symptoms'),
    paymentStatus: boolean('payment_status').default(false),
}, (table) => [
    index('consultantId_idx').on(table.consultantId),
    index('patientId_idx').on(table.patientId),
    index('bookingDate_idx').on(table.date)
],
);