import { userTable } from '@src/db/users';
import { pgTable } from 'drizzle-orm/pg-core';
import { uuid, timestamp, varchar } from 'drizzle-orm/pg-core';

export const recentActivityTable = pgTable('recent_activity', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  action: varchar('action').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type recentActivityTableInsertType =
  typeof recentActivityTable.$inferInsert;
export type recentActivityTableSelectType =
  typeof recentActivityTable.$inferSelect;
