
import { userTable } from '@src/db/users';
import { pgTable } from 'drizzle-orm/pg-core';
import { uuid, timestamp, text, varchar} from 'drizzle-orm/pg-core';


export const healthTipsTable = pgTable('health_tips', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').references(() => userTable.id, {onDelete: 'cascade'}).notNull(), 
    title: varchar('title').notNull(), 
    message: text('message').notNull(), 
    minutesToRead: varchar('minutes_to_read').notNull(), 
    category: varchar('category').notNull(), 
    img: text('img').notNull(), 
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type healthTipsTableInsertType = typeof healthTipsTable.$inferInsert;
export type healthTipsTableSelectType = typeof healthTipsTable.$inferSelect;
