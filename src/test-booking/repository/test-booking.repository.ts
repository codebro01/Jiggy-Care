import { Injectable, Inject } from '@nestjs/common';
import { labTable, patientTable, testBookingTable, testTable } from '@src/db';
import { and, eq } from 'drizzle-orm';
import { CreateTestBookingDto } from '@src/test-booking/dto/create-test-booking.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UpdateTestBookingDto } from '@src/test-booking/dto/update-test-booking.dto';

@Injectable()
export class TestBookingRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async create(
    data: CreateTestBookingDto & {
      invoiceId?: string;
      reference?: string;
      paymentStatus?: string;
      paymentMethod?: string;
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
    const [testBooking] = await this.DbProvider.select({
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
      )
      .limit(1);

    return testBooking;
  }
  async findByTestBookingId(testBookingId: string) {
    const [testBooking] = await this.DbProvider.select({
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
          eq(testBookingTable.paymentStatus, 'PAID'),
        ),
      )
      .limit(1);

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
    data: { reference: string; paymentStatus: string },
    patientId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [testBooking] = await Trx.update(testBookingTable)
      .set({ paymentStatus: data.paymentStatus })
      .where(and(eq(testBookingTable.patientId, patientId)))
      .returning();
    return testBooking;
  }

  async listAllTestBookings() {
    const testBookings = await this.DbProvider.select()
      .from(testBookingTable)
      .leftJoin(
        patientTable,
        eq(patientTable.userId, testBookingTable.patientId),
      )
      .leftJoin(labTable, eq(labTable.id, testBookingTable.labId))
      .leftJoin(testTable, eq(testTable.id, testBookingTable.testId))
      .where(eq(testBookingTable.paymentStatus, 'PAID'));
    return testBookings;
  }

  async updateTestBookingCompletion(testBookingId: string) {
    const testBooking = await this.DbProvider.update(testBookingTable)
      .set({ completed: true })
      .where(eq(testBookingTable.id, testBookingId));

    return testBooking;
  }
}
