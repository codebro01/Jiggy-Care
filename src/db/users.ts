import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  boolean,
  text,
  integer,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';
import { jsonb } from 'drizzle-orm/pg-core';
import { specialityTable } from '@src/db/speciality';

export const userTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  // displayName: varchar('displayName', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 10 }).notNull(),
  password: varchar('password', { length: 500 }).notNull(),
  address: varchar('address', { length: 255 }).default('Lagos, Nigeria'),
  emailVerified: boolean('is_email_Verified').default(false).notNull(),
  fullName: varchar('fullName', { length: 255 }).notNull(),
  dateOfBirth: varchar('date_of_birth', { length: 20 }),
  gender: varchar('gender', { length: 20 }),
  dp: varchar('dp', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  authProvider: varchar('authProvider', { length: 20 })
    .default('local')
    .notNull(),
  refreshToken: text('refreshToken'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const patientTable = pgTable('patients', {
  userId: uuid()
    .primaryKey()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .unique(),
  id: uuid().defaultRandom().notNull(),
  emergencyContact: jsonb('emergency_contact').$type<{
    relationship: string;
    name: string;
    phone: string;
  }>(),
  weight: varchar('weight', { length: 50 }),
  height: varchar('height', { length: 50 }),
  bloodType: varchar('bloodType', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const consultantTable = pgTable('consultants', {
  id: uuid().defaultRandom().notNull(),

  userId: uuid()
    .primaryKey()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .unique(),
  availability: boolean('availability').default(false),
  speciality: uuid('speciality')
    .references(() => specialityTable.id, { onDelete: 'cascade' })
    .default('04485053-bd76-4ca4-a8ee-250fb82cbea8')
    .notNull(),
  yrsOfExperience: integer('years_of_experience'),
  about: text('about'),
  languages: text('languages').array(),
  education: text('education').array(),
  certification: text('certification').array(),
  workingHours: jsonb('working_hours').$type<{
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  }>(),
  approvedStatus: boolean('approved_status').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ! add ratings, prescripto, table in antoher file,

export type UserType = InferSelectModel<typeof userTable>;
export type consultantInsertType = typeof consultantTable.$inferInsert;
export type patientInsertType = typeof patientTable.$inferInsert;
