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


export const userTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  // displayName: varchar('displayName', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 10 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  emailVerified: boolean('is_email_Verified').default(false).notNull(),
  fullName: varchar('fullName', { length: 255 }).notNull(),
  dateOfBirth: varchar('date_of_birth', { length: 20 }),
  gender: varchar('gender', { length: 20 }),
  dp: varchar('dp', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  authProvider: varchar('authProvider', { length: 20 })
    .default('local')
    .notNull(),
  refreshToken: varchar('refreshToken', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const patientTable = pgTable('patients', {
  userId: uuid().notNull().references(() => userTable.id, { onDelete: 'cascade' }),
  id: uuid().defaultRandom().primaryKey().notNull(),
  emergencyContact: varchar('emergencyContact', { length: 255 }),
  weight: varchar('weight', { length: 50 }),
  height: varchar('height', { length: 50 }),
  bloodType: varchar('bloodType', { length: 50 }),
});

export const consultantTable = pgTable('consultants', {
  id: uuid().defaultRandom().primaryKey().notNull(),

  userId: uuid().notNull().references(() => userTable.id, { onDelete: 'cascade' }),
  availability: boolean('availability').default(false),
  speciality: varchar('speciality', { length: 50 }),
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
  pricePerSession: integer('price_per_session'),
});

// ! add ratings, medications, table in antoher file,

export type UserType = InferSelectModel<typeof userTable>;

