import { Injectable, Inject } from '@nestjs/common';
import { testBookingPaymentTable, testBookingPaymentInsertType } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TestBookingPaymentRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async savePayment(
    data: Omit<testBookingPaymentInsertType, 'patientId'>,
    patientId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [testBooking] = await Trx.insert(testBookingPaymentTable)
      .values({ ...data, patientId })
      .returning();
    return testBooking;
  }
}