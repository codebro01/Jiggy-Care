import { cartTable } from '@src/db/cart';
import { pgEnum } from 'drizzle-orm/pg-core';
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  doublePrecision,
  jsonb,
} from 'drizzle-orm/pg-core';

export interface OrderItem {
  medicationId: string;
  medicationName: string;
  gram: number;
  quantity: number;
  price: number;
}

export const orderDeliveryStatusType = pgEnum('order_delivery_status_type', ['DELIVERED', 'PROCESSING'])

export const  orderPaymentStatus = pgEnum('order_payment_status', ['unpaid', 'paid'])

export const orderTable = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: varchar('order_id', { length: 50 }).notNull().unique(),
  cartId: uuid('cart_id')
    .references(() => cartTable.id, { onDelete: 'cascade' })
    .notNull()
    .default('60f2cc4e-3002-44bc-89ea-f91c419ebab4'),
  userId: uuid('userId').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_transit, delivered, cancelled
  reference: varchar('reference', { length: 100 }).notNull(),
  items: jsonb('items').$type<OrderItem[]>().notNull(), // Array of {medicationName, gram, quantity, price}
  totalAmount: doublePrecision('total_amount').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  paymentStatus: orderPaymentStatus('payment_status').default('unpaid').notNull(),
  paymentMethod: text('payment_method').notNull(),
  transactionType: text('transaction_type').notNull(),
  deliveryStatus: orderDeliveryStatusType('delivery_status').default('PROCESSING'), 
  deliveryDate: timestamp('delivery_date'),
  orderDate: timestamp('order_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type OrderSelectType = typeof orderTable.$inferSelect;
