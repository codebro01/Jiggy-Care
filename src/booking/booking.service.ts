import { ForbiddenException, Injectable } from '@nestjs/common';
import { BookingRepository } from '@src/booking/repository/booking.repository';
import { CreateBookingDto } from '@src/booking/dto/createBooking.dto';
import { NotFoundException } from '@nestjs/common';
import { ConsultantRepository } from '@src/consultant/repository/consultant.repository';
import { eq, gte, lte, ne } from 'drizzle-orm';
import { bookingTable } from '@src/db';
import { BadRequestException } from '@nestjs/common';
import { bookingTableSelectType } from '@src/db';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueryBookingDto } from '@src/booking/dto/query-booking.dto';

type DayName =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly consultantRepository: ConsultantRepository,
  ) {}

  async createBooking(
    data: CreateBookingDto,
    patientId: string,
    consultantId: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight for accurate comparison

    const bookingDate = new Date(data.date);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException('You cannot book a day in the past');
    }

    const isConsultantExist =
      await this.consultantRepository.findApprovedConsultantById(consultantId);
    console.log(isConsultantExist, consultantId);
    if (!isConsultantExist) throw new NotFoundException('Consultant not found');

    const booking = await this.bookingRepository.createBooking(
      data,
      patientId,
      consultantId,
    );

    return booking;
  }

  async getAvailableSlots(consultantId: string, date: string) {
    const bookingDate = new Date(date);

    const dayNames: DayName[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const dayName = dayNames[bookingDate.getDay()];

    // 1. Get consultant with working hours
    const consultant =
      await this.consultantRepository.findApprovedConsultantById(consultantId);

    console.log(consultant, consultantId);

    if (!consultant) {
      throw new NotFoundException('Consultant not found');
    }
    if (!consultant.workingHours) {
      throw new NotFoundException('Could not get consultant working hours');
    }

    // 2. Get working hours for the day
    const daySchedule = consultant.workingHours?.[dayName];

    if (!daySchedule) {
      return {
        date,
        day: dayName,
        availableSlots: [],
        message: `Consultant doesn't work on ${dayName}s`,
      };
    }

    // 3. Parse working hours (e.g., "10am - 5pm")
    const [startStr, endStr] = daySchedule.split('-');
    const workingHours = {
      start: this.parseTime(startStr),
      end: this.parseTime(endStr),
    };

    // 4. Generate all possible time slots
    const allSlots = this.generateTimeSlots(
      workingHours.start,
      workingHours.end,
    );

    // 5. Get booked slots for that day
    const dayStart = new Date(bookingDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(bookingDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedSlots = await this.bookingRepository.findBookingsByConditions([
      eq(bookingTable.consultantId, consultantId),
      gte(bookingTable.date, dayStart),
      lte(bookingTable.date, dayEnd),
    ]);

    // 6. Get booked hours
    const bookedHours = bookedSlots.map((booking: bookingTableSelectType) =>
      new Date(booking.date).getHours(),
    );

    // 7. Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedHours.includes(slot.hour),
    );

    return {
      date,
      day: dayName,
      workingHours: daySchedule,
      availableSlots,
      bookedSlots: allSlots.filter((slot) => bookedHours.includes(slot.hour)),
    };
  }

  private parseTime(timeStr: string): number {
    const match = timeStr.trim().match(/(\d+)(am|pm)/i);
    if (!match) return -1;

    let hours = parseInt(match[1]);
    const period = match[2].toLowerCase();

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return hours;
  }

  private generateTimeSlots(startHour: number, endHour: number) {
    const slots = [];

    // Handle overnight shifts (e.g., 10pm - 4am)

    if (startHour > endHour) {
      // From start to midnight

      for (let hour = startHour; hour < 24; hour++) {
        slots.push({
          hour,
          display: this.formatHour(hour),
          value: `${hour}:00:00`,
        });
      }
      // From midnight to end
      for (let hour = 0; hour < endHour; hour++) {
        slots.push({
          hour,
          display: this.formatHour(hour),
          value: `${hour}:00:00`,
        });
      }
    } else {
      // Normal shift
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          hour,
          display: this.formatHour(hour),
          value: `${hour}:00:00`,
        });
      }
    }

    return slots;
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }

  async validateBookingSlot(
    date: string,
    consultantId: string,
    bookingIdToExclude?: string,
  ) {
    const bookingDate = new Date(date);

    // Check for bookings in the same hour
    const hourStart = new Date(bookingDate);
    hourStart.setMinutes(0, 0, 0);

    const hourEnd = new Date(bookingDate);
    hourEnd.setMinutes(59, 59, 999);

    const conditions = [
      eq(bookingTable.consultantId, consultantId),
      gte(bookingTable.date, hourStart),
      lte(bookingTable.date, hourEnd),
    ];

    if (bookingIdToExclude) {
      conditions.push(ne(bookingTable.id, bookingIdToExclude));
    }

    const [existingBooking] =
      await this.bookingRepository.findBookingsByConditions(conditions);

    if (existingBooking) {
      throw new BadRequestException(
        `Time slot at ${bookingDate.getHours() - 1}:00 is already booked`,
      );
    }

    return true;
  }

  async getPatientUpcomingBookings(patientId: string) {
    const bookings =
      await this.bookingRepository.getPatientUpcomingBookings(patientId);
    return bookings;
  }
  async getPatientCompletedBookings(patientId: string) {
    const bookings =
      await this.bookingRepository.getPatientCompletedBookings(patientId);
    return bookings;
  }
  async getConsultantUpcomingBookings(consultantId: string) {
    const bookings =
      await this.bookingRepository.getConsultantUpcomingBookings(consultantId);
    return bookings;
  }
  async getConsultantAllBookings(consultantId: string) {
    const bookings =
      await this.bookingRepository.getConsultantAllBookings(consultantId);
    return bookings;
  }
  async getConsultantCompletedBookings(consultantId: string) {
    const bookings =
      await this.bookingRepository.getConsultantCompletedBookings(consultantId);
    return bookings;
  }

  async totalCompletedBookings(patientId: string) {
    return await this.bookingRepository.totalCompletedBookings(patientId);
  }

  // !consultant starts appointment

  async startAppointment(bookingId: string, consultantId: string) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      consultantId,
    );
    if (!booking[0] || booking[0].consultantId !== consultantId) {
      throw new ForbiddenException('Not authorized');
    }

    if (booking[0].status !== 'upcoming') {
      throw new BadRequestException('Appointment already started or completed');
    }

    return await this.bookingRepository.updateBooking(
      {
        status: 'in_progress',
        actualStart: new Date(),
      },
      bookingId,
      consultantId,
    );
  }
  // ! consultant completes appointment
  async consultantCompleteAppointment(
    bookingId: string,
    consultantId: string,
    notes: string,
  ) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      consultantId,
    );
    if (!booking[0] || booking[0].consultantId !== consultantId) {
      throw new ForbiddenException('Not authorized');
    }

    if (booking[0].status !== 'in_progress') {
      throw new BadRequestException('Appointment not in progress');
    }

    return await this.bookingRepository.updateBooking(
      {
        status: 'pending_confirmation',
        actualEnd: new Date(),
        consultantCompletedAt: new Date(),
        consultantConfirmed: true,
        consultationNotes: notes,
        updatedAt: new Date(),
      },
      bookingId,
      consultantId,
    );

    // TODO: Send notification to patient to confirm
  }

  // ! patient confirms consultant completion
  async patientConfirmAppointment(
    bookingId: string,
    patientId: string,
    confirmed: boolean,
    reason?: string,
  ) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      patientId,
    );

    if (!booking[0] || booking[0].patientId !== patientId) {
      throw new ForbiddenException('Not authorized');
    }

    if (booking[0].status !== 'pending_confirmation') {
      throw new BadRequestException('Appointment not pending confirmation');
    }

    const newStatus = confirmed ? 'completed' : 'disputed';

    return await this.bookingRepository.updateBooking(
      {
        status: newStatus,
        patientCompletedAt: new Date(),
        patientConfirmed: confirmed,
        disputeReason: confirmed ? null : reason,
        updatedAt: new Date(),
      },
      bookingId,
      patientId,
    );

    // TODO: If disputed, notify admin/support
  }

  //! Consultant marks patient as no-show
  async markNoShow(bookingId: string, consultantId: string) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      consultantId,
    );

    if (!booking[0] || booking[0].consultantId !== consultantId) {
      throw new ForbiddenException('Not authorized');
    }

    //! consultant Can only mark no-show if  in_progress
    if (!['in_progress'].includes(booking[0].status)) {
      throw new BadRequestException('Cannot mark as no-show');
    }

    return await this.bookingRepository.updateBooking(
      {
        status: 'no_show',
        consultantMarkedNoShow: true,
        updatedAt: new Date(),
      },
      bookingId,
      consultantId,
    );
  }

  //! Cron job: Auto-complete if patient doesn't respond within 24hrs
  @Cron(CronExpression.EVERY_HOUR)
  async autoCompleteStaleAppointments() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await this.bookingRepository.updateBookingAfterInterval(
      twentyFourHoursAgo,
    );
  }

  async listBookingsByFilter(query: QueryBookingDto) {
    const bookings = await this.bookingRepository.listBookingsByFilter(query);

    return bookings;
  }
}
