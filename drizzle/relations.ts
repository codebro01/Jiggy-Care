import { relations } from "drizzle-orm/relations";
import { users, patients, consultants, payments, bookings, notifications, ratings, prescriptions, tests, testBookings, labs, healthMonitoring } from "./schema";

export const patientsRelations = relations(patients, ({one}) => ({
	user: one(users, {
		fields: [patients.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	patients: many(patients),
	consultants: many(consultants),
	payments_patientId: many(payments, {
		relationName: "payments_patientId_users_id"
	}),
	payments_consultantId: many(payments, {
		relationName: "payments_consultantId_users_id"
	}),
	notifications: many(notifications),
	ratings_consultantId: many(ratings, {
		relationName: "ratings_consultantId_users_id"
	}),
	ratings_patientId: many(ratings, {
		relationName: "ratings_patientId_users_id"
	}),
	prescriptions_patientId: many(prescriptions, {
		relationName: "prescriptions_patientId_users_id"
	}),
	prescriptions_consultantId: many(prescriptions, {
		relationName: "prescriptions_consultantId_users_id"
	}),
	bookings_consultantId: many(bookings, {
		relationName: "bookings_consultantId_users_id"
	}),
	bookings_patientId: many(bookings, {
		relationName: "bookings_patientId_users_id"
	}),
	testBookings: many(testBookings),
	healthMonitorings: many(healthMonitoring),
}));

export const consultantsRelations = relations(consultants, ({one}) => ({
	user: one(users, {
		fields: [consultants.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user_patientId: one(users, {
		fields: [payments.patientId],
		references: [users.id],
		relationName: "payments_patientId_users_id"
	}),
	user_consultantId: one(users, {
		fields: [payments.consultantId],
		references: [users.id],
		relationName: "payments_consultantId_users_id"
	}),
	booking: one(bookings, {
		fields: [payments.bookingId],
		references: [bookings.id]
	}),
}));

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	payments: many(payments),
	user_consultantId: one(users, {
		fields: [bookings.consultantId],
		references: [users.id],
		relationName: "bookings_consultantId_users_id"
	}),
	user_patientId: one(users, {
		fields: [bookings.patientId],
		references: [users.id],
		relationName: "bookings_patientId_users_id"
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
	user_consultantId: one(users, {
		fields: [ratings.consultantId],
		references: [users.id],
		relationName: "ratings_consultantId_users_id"
	}),
	user_patientId: one(users, {
		fields: [ratings.patientId],
		references: [users.id],
		relationName: "ratings_patientId_users_id"
	}),
}));

export const prescriptionsRelations = relations(prescriptions, ({one}) => ({
	user_patientId: one(users, {
		fields: [prescriptions.patientId],
		references: [users.id],
		relationName: "prescriptions_patientId_users_id"
	}),
	user_consultantId: one(users, {
		fields: [prescriptions.consultantId],
		references: [users.id],
		relationName: "prescriptions_consultantId_users_id"
	}),
}));

export const testBookingsRelations = relations(testBookings, ({one}) => ({
	test: one(tests, {
		fields: [testBookings.testId],
		references: [tests.id]
	}),
	user: one(users, {
		fields: [testBookings.patientId],
		references: [users.id]
	}),
	lab: one(labs, {
		fields: [testBookings.labId],
		references: [labs.id]
	}),
}));

export const testsRelations = relations(tests, ({many}) => ({
	testBookings: many(testBookings),
}));

export const labsRelations = relations(labs, ({many}) => ({
	testBookings: many(testBookings),
}));

export const healthMonitoringRelations = relations(healthMonitoring, ({one}) => ({
	user: one(users, {
		fields: [healthMonitoring.patientId],
		references: [users.id]
	}),
}));