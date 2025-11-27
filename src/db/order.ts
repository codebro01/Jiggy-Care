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

export const orderTable = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: varchar('order_id', { length: 50 }).notNull().unique(),
  userId: uuid('userId').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_transit, delivered, cancelled
  reference: varchar('reference', { length: 100 }).notNull(),
  items: jsonb('items').$type<OrderItem[]>().notNull(), // Array of {medicationName, gram, quantity, price}
  totalAmount: doublePrecision('total_amount').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  paymentStatus: text('payment_status').default('unpaid').notNull(), 
  paymentMethod: text('payment_method').notNull(), 
  transactionType: text('transaction_type').notNull(), 

  deliveryDate: timestamp('delivery_date'),
  orderDate: timestamp('order_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type OrderSelectType = typeof orderTable.$inferSelect;
