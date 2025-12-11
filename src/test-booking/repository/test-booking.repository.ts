import { Injectable, Inject } from '@nestjs/common';
import { testBookingTable } from '@src/db';
import { and, eq } from 'drizzle-orm';
import { CreateTestBookingDto } from '@src/test-booking/dto/create-test-booking.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UpdateTestBookingDto } from '@src/test-booking/dto/update-test-booking.dto';

@Injectable()
export class TestBookingRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async savePayment(
    data: CreateTestBookingDto & {
      invoiceId?: string;
      reference?: string;
      paymentStatus: string;
    },
    patientId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [testBooking] = await Trx.insert(testBookingTable)
      .values({ ...data, patientId })
      .returning();
    return testBooking;
  }

  async findAll(patientId: string) {
    const testBooking = await this.DbProvider.select({
      id: testBookingTable.id,
      testId: testBookingTable.testId,
      labId: testBookingTable.labId || null,
      paymentStatus: testBookingTable.paymentStatus,
      collection: testBookingTable.collection,
      date: testBookingTable.date,
    })
      .from(testBookingTable)
      .where(eq(testBookingTable.patientId, patientId));

    return testBooking;
  }

  async findOne(testBookingId: string, patientId: string) {
    const testBooking = await this.DbProvider.select({
      id: testBookingTable.id,
      testId: testBookingTable.testId,
      labId: testBookingTable.labId || null,
      paymentStatus: testBookingTable.paymentStatus,
      collection: testBookingTable.collection,
      date: testBookingTable.date,
    })
      .from(testBookingTable)
      .where(
        and(
          eq(testBookingTable.id, testBookingId),
          eq(testBookingTable.patientId, patientId),
        ),
      );

    return testBooking;
  }

  async update(
    data: UpdateTestBookingDto,
    testBookingId: string,
    patientId: string,
  ) {
    const [testBooking] = await this.DbProvider.update(testBookingTable)
      .set(data)
      .where(
        and(
          eq(testBookingTable.id, testBookingId),
          eq(testBookingTable.patientId, patientId),
        ),
      )
      .returning();
    return testBooking;
  }
  async updatePaymentStatus(
    data: {reference: string, paymentStatus: string}, patientId: string, trx?:any
  ) {
    const Trx = trx || this.DbProvider
    const [testBooking] = await Trx.update(testBookingTable)
      .set({paymentStatus: data.paymentStatus})
      .where(
        and(
          eq(testBookingTable.reference, data.reference),
          eq(testBookingTable.patientId, patientId),
        ),
      )
      .returning();
    return testBooking;
  }
}
