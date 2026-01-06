import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateBookingDto } from '../dto/createBooking.dto';
import { or, eq, and, desc, lt } from 'drizzle-orm';
import { NotFoundError } from 'rxjs';
import {
  bookingTable,
  specialityTable,
  consultantTable,
  userTable,
  bookingTableInsertType,
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

    let query = Trx.select({
      pricePerSession: specialityTable.price,
      paymentStatus: bookingTable.paymentStatus,
    })
      .from(bookingTable)
      .where(and(eq(bookingTable.id, bookingId), or(...conditions)));
    if (consultantId) {
      query.leftJoin(consultantTable, eq(consultantTable.userId, consultantId));
    }

    query = query.leftJoin(
      specialityTable,
      eq(specialityTable.id, consultantTable.speciality),
    );

    const [result] = await query.limit(1);

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
      speciality: specialityTable.name,
      date: bookingTable.date,
      consultantId: consultantTable.userId,
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

  async totalCompletedBookings(patientId: string) {
    const [totalCompletedBookings] = await this.DbProvider.select({
      totalCompletedAppointments: count(),
    })
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.patientId, patientId),
          eq(bookingTable.status, 'completed'),
        ),
      );

    return totalCompletedBookings.totalCompletedAppointments;
  }

  // Patient confirms booking (step 2 of 2)

  // Consultant marks patient as no-show
  async markNoShow(bookingId: string, consultantId: string) {
    const booking = await this.DbProvider.select()
      .from(bookingTable)
      .where(eq(bookingTable.id, bookingId))
      .limit(1);

    if (!booking[0] || booking[0].consultantId !== consultantId) {
      throw new ForbiddenException('Not authorized');
    }

    // Can only mark no-show if  in_progress
    if (!['in_progress'].includes(booking[0].status)) {
      throw new BadRequestException('Cannot mark as no-show');
    }

    return await this.DbProvider.update(bookingTable)
      .set({
        status: 'no_show',
        consultantMarkedNoShow: true,
        updatedAt: new Date(),
      })
      .where(eq(bookingTable.id, bookingId))
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


  async listBookingsByFilter(query: QueryBookingDto) {
    const limit = query.limit || 10;
    const page =  query.page || 1;

    const offset = (page - 1) * limit
      const bookings = await this.DbProvider.select().from(bookingTable).where(eq(bookingTable.status, query.status)).limit(limit).offset(offset)

      return bookings;
  }

    
}
