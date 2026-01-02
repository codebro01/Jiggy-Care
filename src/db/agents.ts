import { userTable } from '@src/db/users';
import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

export const agentTable = pgTable('agents', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').references(() => userTable.id, {
    onDelete: 'cascade',
  }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
