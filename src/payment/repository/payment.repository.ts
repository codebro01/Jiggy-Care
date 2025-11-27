import {
  Inject,
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePaymentDto } from '@src/payment/dto/createPaymentDto';
import {
  userTable,
  paymentTable
} from '@src/db';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { NotificationRepository } from '@src/notification/repository/notification.repository';


export const generateSecureInvoiceId = () => {
  const randomHex = crypto.randomUUID().substring(0, 8);
  return `INV-${randomHex}`;
};
export const generateSecureOrderId = () => {
  const randomHex = crypto.randomUUID().substring(0, 8);
  return `ORD-${randomHex}`;
};
export const generateSecureRef = () => {
  const randomAlphanumeric = crypto
    .randomUUID()
    .replace(/-/g, '')
    .substring(0, 8)
    .toUpperCase();
  return `JGC-${Date.now()}-${randomAlphanumeric}`;
};

@Injectable()
export class PaymentRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private notificationRepository: NotificationRepository,
  ) { }

  // ! Transaction wrapper
  async executeInTransaction<T>(
    callback: (trx: any) => Promise<T>,
  ): Promise<T> {
    return await this.DbProvider.transaction(async (trx) => {
      return await callback(trx);
    });
  }

  async savePayment(
    data: CreatePaymentDto & {
      paymentMethod: string;
      paymentStatus: string;
      reference: string;
      transactionType: string;
    },
    userId: string,
    trx?: typeof this.DbProvider,
  ) {
    const DbTrx = trx || this.DbProvider;
    const [payment] = await DbTrx.insert(paymentTable)
      .values({ patientId: userId, ...data })
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, saving payment',
      );

    return { message: 'success', data: payment };
  }
  async updatePaymentStatus(
    data: {
      reference: string;
      status: string;
    },
    userId: string,
    trx?: typeof this.DbProvider,
  ) {
    const DbTrx = trx || this.DbProvider;
    const { reference, status } = data;
    const [payment] = await DbTrx.update(paymentTable)
      .set({ paymentStatus: status })
      .where(
        and(
          eq(paymentTable.reference, reference),
          eq(paymentTable.patientId, userId),
        ),
      )
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, saving payment',
      );

    return { message: 'success', data: payment };
  }

  async getPayments(userId: string) {
    const payments = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!payments) {
      throw new InternalServerErrorException(
        'An error occured fetching payments',
      );
    }

    return { message: 'succcess', payments };
  }


  async findByReference(reference: string) {
    const [payment] = await this.DbProvider.select()
      .from(paymentTable)
      .where(eq(paymentTable.reference, reference))
      .limit(1);

    return payment;
  }

  async listTransactions(userId: string) {
    try {
      const transactions = await this.DbProvider.select({
        invoiceId: paymentTable.invoiceId,
        bookingId: paymentTable.bookingId,
        amount: paymentTable.amount,
        paymentMethod: paymentTable.paymentMethod,
        status: paymentTable.paymentStatus,
      })
        .from(paymentTable)
        .where(eq(paymentTable.patientId, userId));
      // if(!transactions) throw new NotFoundException('Transactions could not be fetched')
      return transactions;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  
}
