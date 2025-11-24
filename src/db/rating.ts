import { pgTable, text, doublePrecision, timestamp, uuid } from "drizzle-orm/pg-core";
import { consultantTable, patientTable, userTable } from "@src/db";



export const ratingTable = pgTable('ratings', {
    id: uuid().defaultRandom().primaryKey().notNull(), 
    consultantId: uuid('consultantId').references(() => consultantTable.userId).notNull(), 
    patientId: uuid('patientId').references(() => patientTable.userId).notNull(), 
    rating: doublePrecision('rating').notNull(), 
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(), 
    updatedAt: timestamp('updated_at').defaultNow().notNull(), 
})

