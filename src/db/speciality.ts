import { pgTable, text, doublePrecision, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "@src/db/users";


export const specialityTable = pgTable('speciality', {
    id: uuid().defaultRandom().primaryKey().notNull(), 
    userId: uuid('userId').references(() => userTable.id, {onDelete: 'cascade'}).notNull(), 
    name: varchar('name', {length: 255}).notNull(),
    description: text('description'),
    price: doublePrecision('price').notNull(), 
    createdAt: timestamp('created_at').defaultNow().notNull(), 
    updatedAt: timestamp('updated_at').defaultNow().notNull(), 
})

export type specialitySelectType = typeof specialityTable.$inferSelect
export type specialityInsertType = typeof specialityTable.$inferInsert;

