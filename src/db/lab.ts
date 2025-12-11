import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const labTable = pgTable('labs', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    createdBy: uuid('createdBy').notNull(),
    name: varchar('name', {length:255}).notNull(), 
    address: varchar('address', {length: 255}).notNull(), 
    phone: varchar('phone', {length: 255}).notNull(), 
    createdAt: timestamp('created_at').defaultNow(), 
    updatedAt: timestamp('updated_at').defaultNow(), 
})

export type labTableInsertType = typeof labTable.$inferInsert;
export type labTableSelectType = typeof labTable.$inferSelect;