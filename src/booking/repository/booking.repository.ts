import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateBookingDto } from '../dto/createBooking.dto';
import { or, eq, and, desc, lt, sql } from 'drizzle-orm';
import { NotFoundError } from 'rxjs';
import {
  bookingTable,
  specialityTable,
  consultantTable,
  userTable,
  bookingTableInsertType,
  ratingTable,
} from '@src/db';
import { SQL, count } from 'drizzle-orm';
import { QueryBookingDto } from '@src/booking/dto/query-booking.dto';

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
      .values({
        ...data,
        date: new Date(data.date),
        actualStart: new Date(data.date),
        consultantId,
        patientId,
        paymentStatus: false,
      })
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

    const query = Trx.select({
      pricePerSession: specialityTable.price,
      paymentStatus: bookingTable.paymentStatus,
      patientId: bookingTable.patientId,
      consultantId: bookingTable.consultantId,
      appointmentDate: bookingTable.date,
      status: bookingTable.status,

    })
      .from(bookingTable)
      .leftJoin(
        consultantTable,
        eq(consultantTable.userId, bookingTable.consultantId),
      )
      .leftJoin(
        specialityTable,
        eq(specialityTable.id, consultantTable.speciality),
      )
      .where(and(eq(bookingTable.id, bookingId), or(...conditions)))
      .limit(1);

    const [result] = await query;

    return result;
  }
  async updateBooking(
    data: Partial<bookingTableInsertType>,
    bookingId: string,
    patientId: string,
  ) {
    const [booking] = await this.DbProvider.update(bookingTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTable.id, bookingId),
          eq(bookingTable.patientId, patientId),
        ),
      )
      .returning();

    return booking;
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

    const bookings = await Trx.select({
      fullName: userTable.fullName,
      bookingId: bookingTable.id,
      speciality: specialityTable.name,
      date: bookingTable.date,
      status: bookingTable.status, 
      consultantId: consultantTable.userId,
      rating: sql<number>`ROUND(CAST(AVG(${ratingTable.rating}) AS numeric), 2)`,
    })
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.patientId, patientId),
          eq(bookingTable.paymentStatus, true),
          eq(bookingTable.status, 'upcoming'),
        ),
      )
      .innerJoin(
        consultantTable,
        eq(consultantTable.userId, bookingTable.consultantId),
      )
      .innerJoin(userTable, eq(userTable.id, consultantTable.userId))
      .leftJoin(
        specialityTable,
        eq(specialityTable.id, consultantTable.speciality),
      )
      .leftJoin(
        ratingTable,
        eq(ratingTable.consultantId, consultantTable.userId),
      )
      .groupBy(
        consultantTable.userId,
        userTable.fullName,
        specialityTable.name,
        bookingTable.date,
        bookingTable.id,
      )
      .orderBy(desc(bookingTable.date));
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

    const bookings = await Trx.select({
      patientId: bookingTable.patientId,
      bookingId: bookingTable.id,
      patientName: userTable.fullName,
      date: bookingTable.date,
      status: bookingTable.status,
      duration: bookingTable.duration,
    })
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.consultantId, consultantId),
          eq(bookingTable.paymentStatus, true),
          eq(bookingTable.status, 'upcoming'),
        ),
      )
      .leftJoin(userTable, eq(userTable.id, bookingTable.patientId))
      .orderBy(desc(bookingTable.date));
    return bookings;
  }
  async getConsultantAllBookings(consultantId: string, trx?: any) {
    const Trx = trx || this.DbProvider;

    const bookings = await Trx.select({
      patientId: bookingTable.patientId,
      consultantId: bookingTable.consultantId,
      bookingId: bookingTable.id,
      patientName: userTable.fullName,
      date: bookingTable.date,
      status: bookingTable.status,
      duration: bookingTable.duration,
    })
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.consultantId, consultantId),
          eq(bookingTable.paymentStatus, true),
        ),
      )
      .leftJoin(userTable, eq(userTable.id, bookingTable.patientId))
      .orderBy(desc(bookingTable.date));
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

  async totalBookings(patientId: string) {
    const [totalBookings] = await this.DbProvider.select({
      total: count(),
    })
      .from(bookingTable)
      .where(and(eq(bookingTable.patientId, patientId)));

    return totalBookings.total;
  }

  // Patient confirms booking (step 2 of 2)

  // Consultant marks patient as no-show
  async consultantMarkNoShow(bookingId: string, consultantId: string) {
    return await this.DbProvider.update(bookingTable)
      .set({
        status: 'no_show',
        consultantMarkedNoShow: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTable.id, bookingId),
          eq(bookingTable.consultantId, consultantId),
        ),
      )
      .returning();
  }
  async patientMarkNoShow(bookingId: string, patientId: string) {
    return await this.DbProvider.update(bookingTable)
      .set({
        status: 'no_show',
        patientMarkedNoShow: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTable.id, bookingId),
          eq(bookingTable.patientId, patientId),
        ),
      )
      .returning();
  }

  async updateBookingAfterInterval(interval: Date) {
    return await this.DbProvider.update(bookingTable)
      .set({
        status: 'completed',
        patientConfirmed: true, // Auto-confirmed
        patientCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTable.status, 'pending_confirmation'),
          lt(bookingTable.consultantCompletedAt, new Date(interval)),
          eq(bookingTable.patientConfirmed, false),
        ),
      )
      .returning();
  }

  async consultantStartAppointment(bookingId: string, consultantId: string) {
    return await this.DbProvider.update(bookingTable)
      .set({
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTable.id, bookingId),
          eq(bookingTable.consultantId, consultantId),
        ),
      )
      .returning();
  }

  async consultantCompleteAppointment(
    data: Pick<bookingTableInsertType, 'consultationNotes'>,
    bookingId: string,
    consultantId: string,
  ) {
    const [booking] = await this.DbProvider.update(bookingTable)
      .set({
        consultationNotes: data.consultationNotes,
        actualEnd: new Date(),
        consultantCompletedAt: new Date(),
        consultantConfirmed: true,
        status: 'pending_confirmation',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTable.id, bookingId),
          eq(bookingTable.consultantId, consultantId),
        ),
      )
      .returning();

    return booking;
  }

  async patientCompleteAppointment(
    data: Pick<
      bookingTableInsertType,
      'patientConfirmed' | 'disputeReason' | 'status'
    >,
    bookingId: string,
    patientId: string,
  ) {
    const [booking] = await this.DbProvider.update(bookingTable)
      .set({
        status: data.status,
        patientCompletedAt: new Date(),
        patientConfirmed: data.patientConfirmed,
        disputeReason: data.disputeReason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingTable.id, bookingId),
          eq(bookingTable.patientId, patientId),
        ),
      )
      .returning();

    return booking;
  }

  async listBookingsByFilter(query: QueryBookingDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;

    const offset = (page - 1) * limit;
    const bookings = await this.DbProvider.select()
      .from(bookingTable)
      .where(eq(bookingTable.status, query.status))
      .limit(limit)
      .offset(offset);

    return bookings;
  }
}
