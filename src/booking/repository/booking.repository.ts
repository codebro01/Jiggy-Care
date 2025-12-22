import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateBookingDto } from '../dto/createBooking.dto';
import { or, eq, and } from 'drizzle-orm';
import { NotFoundError } from 'rxjs';
import { bookingTable, consultantTable } from '@src/db';
import { SQL } from 'drizzle-orm';

@Injectable()
export class BookingRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  // ! create bookings
  async createBooking(
    data: CreateBookingDto,
    patientId: string,
    consultantId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    const [booking] = await Trx.insert(bookingTable)
      .values({ ...data, date: new Date(data.date), consultantId, patientId , paymentStatus: false})
      .returning();

    return booking;
  }

  // ! get booking
  async getBooking(
    bookingId: string,
    consultantId?: string,
    patientId?: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    if (!consultantId && !patientId)
      throw new BadRequestException(
        'Please provide either a patient or a consultant identity',
      );

    const conditions = [];

    if (consultantId)
      conditions.push(eq(bookingTable.consultantId, consultantId));

    if (patientId) conditions.push(eq(bookingTable.patientId, patientId));

    const query =  Trx.select({
        pricePerSession: consultantTable.pricePerSession, 
        paymentStatus: bookingTable.paymentStatus 
    })
      .from(bookingTable)
      .where(and(eq(bookingTable.id, bookingId),  or(...conditions)));

    if (consultantId) {
      query.leftJoin(consultantTable, eq(consultantTable.userId, consultantId));
    }

    const [result] = await query.limit(1);

    return result;
  }

  async findBookingsByConditions(conditions: SQL[], trx?: any) {
    const Trx = trx || this.DbProvider;
    if (conditions.length < 1)
      throw new BadRequestException(
        'Please provide at least one condition  to find bookings',
      );

    const bookings = await Trx.select()
      .from(bookingTable)
      .where(and(...conditions));

    return bookings;
  }

  async getBookingByDate(
    date: string,
    bookingId: string,
    consultantId?: string,
    patientId?: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    if (!consultantId && !patientId)
      throw new BadRequestException(
        'Please provide either a patient or a consultant identity',
      );

    const conditions = [];

    if (consultantId)
      conditions.push(eq(bookingTable.consultantId, consultantId));

    if (patientId) conditions.push(eq(bookingTable.patientId, patientId));

    const [booking] = await Trx.select({ date: bookingTable.date })
      .from(bookingTable)
      .where(and(eq(bookingTable.id, bookingId), or(...conditions)))
      .limit(1);

    if (!booking) throw new NotFoundError('Booking could not be  found!!!');

    return booking;
  }

 
  async getPatientUpcomingBookings(patientId: string, trx?: any) {
    const Trx = trx || this.DbProvider;

    const bookings = await Trx.select()
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.patientId, patientId),
          eq(bookingTable.paymentStatus, true),
          eq(bookingTable.status, 'upcoming'),
        ),
      );
    return bookings;
  }
  async getPatientCompletedBookings(patientId: string, trx?: any) {
    const Trx = trx || this.DbProvider;

    const bookings = await Trx.select()
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.patientId, patientId),
          eq(bookingTable.paymentStatus, true),
          eq(bookingTable.status, 'completed'),
        ),
      );
    return bookings;
  }
  async getConsultantUpcomingBookings(consultantId: string, trx?: any) {
    const Trx = trx || this.DbProvider;

    const bookings = await Trx.select()
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.consultantId, consultantId),
          eq(bookingTable.paymentStatus, true),
          eq(bookingTable.status, 'upcoming'),
        ),
      );
    return bookings;
  }
  async getConsultantCompletedBookings(consultantId: string, trx?: any) {
    const Trx = trx || this.DbProvider;

    const bookings = await Trx.select()
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.consultantId, consultantId),
          eq(bookingTable.paymentStatus, true),
          eq(bookingTable.status, 'completed'),
        ),
      );
    return bookings;
  }

  async updateBookingPaymentStatus(
    data: { paymentStatus: boolean; bookingId: string },
    patientId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    const booking = await Trx.update(bookingTable)
      .set({ paymentStatus: data.paymentStatus })
      .where(
        and(
          eq(bookingTable.id, data.bookingId),
          eq(bookingTable.patientId, patientId),
        ),
      );

    return booking;
  }
}
