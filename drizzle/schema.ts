import { pgTable, unique, uuid, varchar, boolean, timestamp, foreignKey, text, integer, jsonb, doublePrecision, date, index, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const bookingStatusType = pgEnum("booking_status_type", ['completed', 'upcoming'])
export const categoryType = pgEnum("category_type", ['booking', 'order', 'health_tips'])
export const dosageType = pgEnum("dosage_type", ['once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'five_times_daily', 'often'])
export const healthReadingType = pgEnum("health_reading_type", ['blood_pressure', 'heart_rate', 'temperature', 'weight'])
export const notificationStatusType = pgEnum("notification_status_type", ['read', 'unread'])
export const testCollectionType = pgEnum("test_collection_type", ['home_collection', 'visit_lab_centre'])
export const variantType = pgEnum("variant_type", ['info', 'success', 'warning', 'danger'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 10 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	isEmailVerified: boolean("is_email_Verified").default(false).notNull(),
	fullName: varchar({ length: 255 }).notNull(),
	dateOfBirth: varchar("date_of_birth", { length: 20 }),
	gender: varchar({ length: 20 }),
	dp: varchar({ length: 255 }),
	phone: varchar({ length: 50 }),
	authProvider: varchar({ length: 20 }).default('local').notNull(),
	refreshToken: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const patients = pgTable("patients", {
	emergencyContact: varchar({ length: 255 }),
	weight: varchar({ length: 50 }),
	height: varchar({ length: 50 }),
	bloodType: varchar({ length: 50 }),
	userId: uuid().notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "patients_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const consultants = pgTable("consultants", {
	availability: boolean().default(false),
	speciality: varchar({ length: 50 }),
	about: text(),
	languages: text().array(),
	education: text().array(),
	certification: text().array(),
	pricePerSession: integer("price_per_session"),
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	yearsOfExperience: integer("years_of_experience"),
	workingHours: jsonb("working_hours"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "consultants_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	consultantId: uuid("consultant_id").notNull(),
	patientId: uuid("patient_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	senderType: text("sender_type").notNull(),
	content: text().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const testResults = pgTable("test_results", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	consultantId: uuid("consultant_id").notNull(),
	labId: uuid("lab_id"),
	title: varchar({ length: 255 }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	testValues: jsonb("test_values").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	patientId: uuid().notNull(),
	consultantId: uuid().notNull(),
	invoiceId: text("invoice_id"),
	reference: text(),
	bookingId: uuid().notNull(),
	dateInitiated: text("date_initiated"),
	amount: doublePrecision().notNull(),
	paymentMethod: text("payment_method").notNull(),
	paymentStatus: text("payment_status").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [users.id],
			name: "payments_patientId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.consultantId],
			foreignColumns: [users.id],
			name: "payments_consultantId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "payments_bookingId_bookings_id_fk"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	status: notificationStatusType().default('unread').notNull(),
	variant: variantType().default('info').notNull(),
	category: categoryType().notNull(),
	priority: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const ratings = pgTable("ratings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	consultantId: uuid().notNull(),
	patientId: uuid().notNull(),
	rating: doublePrecision().notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.consultantId],
			foreignColumns: [users.id],
			name: "ratings_consultantId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [users.id],
			name: "ratings_patientId_users_id_fk"
		}).onDelete("cascade"),
]);

export const prescriptions = pgTable("prescriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	patientId: uuid().notNull(),
	consultantId: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	dosage: varchar({ length: 100 }).notNull(),
	frequency: dosageType().notNull(),
	pillsRemaining: integer("pills_remaining").notNull(),
	totalPills: integer("total_pills").notNull(),
	startDate: date("start_date").notNull(),
	status: varchar({ length: 50 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [users.id],
			name: "prescriptions_patientId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.consultantId],
			foreignColumns: [users.id],
			name: "prescriptions_consultantId_users_id_fk"
		}).onDelete("cascade"),
]);

export const medications = pgTable("medications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	gram: integer().notNull(),
	description: text().notNull(),
	price: doublePrecision().notNull(),
	rating: doublePrecision().default(0),
	stockStatus: varchar("stock_status", { length: 50 }).default('in_stock').notNull(),
	stockQuantity: integer("stock_quantity").default(0).notNull(),
	category: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: varchar("order_id", { length: 50 }).notNull(),
	userId: uuid().notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	reference: varchar({ length: 100 }).notNull(),
	items: jsonb().notNull(),
	totalAmount: doublePrecision("total_amount").notNull(),
	deliveryAddress: text("delivery_address").notNull(),
	paymentStatus: text("payment_status").default('unpaid').notNull(),
	paymentMethod: text("payment_method").notNull(),
	transactionType: text("transaction_type").notNull(),
	deliveryDate: timestamp("delivery_date", { mode: 'string' }),
	orderDate: timestamp("order_date", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("orders_order_id_unique").on(table.orderId),
]);

export const labs = pgTable("labs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdBy: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	address: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const tests = pgTable("tests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdBy: uuid().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	preparation: text().notNull(),
	durationInHrs: integer("duration_in_hrs").notNull(),
	amount: doublePrecision().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const bookings = pgTable("bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	consultantId: uuid().notNull(),
	patientId: uuid().notNull(),
	date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	duration: integer().default(1),
	symptoms: text().array(),
	status: bookingStatusType().default('upcoming').notNull(),
	paymentStatus: boolean("payment_status").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("bookingDate_idx").using("btree", table.date.asc().nullsLast().op("timestamptz_ops")),
	index("consultantId_idx").using("btree", table.consultantId.asc().nullsLast().op("uuid_ops")),
	index("patientId_idx").using("btree", table.patientId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.consultantId],
			foreignColumns: [users.id],
			name: "bookings_consultantId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [users.id],
			name: "bookings_patientId_users_id_fk"
		}).onDelete("cascade"),
]);

export const testBookings = pgTable("test_bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	testId: uuid().notNull(),
	invoiceId: text("invoice_id"),
	reference: text(),
	patientId: uuid().notNull(),
	paymentMethod: text("payment_method").notNull(),
	paymentStatus: text("payment_status").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	labId: uuid(),
	collection: testCollectionType().notNull(),
	date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.testId],
			foreignColumns: [tests.id],
			name: "test_bookings_testId_tests_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [users.id],
			name: "test_bookings_patientId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.labId],
			foreignColumns: [labs.id],
			name: "test_bookings_labId_labs_id_fk"
		}).onDelete("cascade"),
]);

export const healthMonitoring = pgTable("health_monitoring", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	patientId: uuid().notNull(),
	temperature: jsonb(),
	heartRate: jsonb("heart_rate"),
	weight: jsonb(),
	bloodPressure: jsonb("blood_pressure"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [users.id],
			name: "health_monitoring_patientId_users_id_fk"
		}),
]);
