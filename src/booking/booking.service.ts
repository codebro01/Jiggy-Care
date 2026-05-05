import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { OneSignalService } from '@src/one-signal/one-signal.service';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
import { UserRepository } from '@src/users/repository/user.repository';

type DayName =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

type TimeSlot = {
  hour: number;
  minute: number;
  display: string;
  value: string;
};

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly consultantRepository: ConsultantRepository,
    private readonly oneSignalService: OneSignalService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
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
    const bookingDate = this.parseBookingDate(date);

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
      // eq(bookingTable.paymentStatus, true)
    ]);

    // 6. Get booked hours
    const bookedKeys = bookedSlots.map((booking: bookingTableSelectType) => {
      const d = new Date(booking.date);
      return `${d.getHours()}:${d.getMinutes()}`;
    });

    // 7. Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot: TimeSlot) => !bookedKeys.includes(`${slot.hour}:${slot.minute}`),
    );

    return {
      date,
      day: dayName,
      workingHours: daySchedule,
      availableSlots,
      bookedSlots: allSlots.filter((slot: TimeSlot) =>
        bookedKeys.includes(`${slot.hour}:${slot.minute}`),
      ),
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

  private parseBookingDate(date: string): Date {
    // if frontend sends without timezone, treat it as Lagos time (UTC+1)
    if (!date.includes('+') && !date.includes('Z')) {
      return new Date(`${date}+01:00`);
    }
    return new Date(date);
  }
  // private generateTimeSlots(startHour: number, endHour: number) {
  //   const slots = [];

  //   // Handle overnight shifts (e.g., 10pm - 4am)

  //   if (startHour > endHour) {
  //     // From start to midnight

  //     for (let hour = startHour; hour < 24; hour++) {
  //       slots.push({
  //         hour,
  //         display: this.formatHour(hour),
  //         value: `${hour}:00:00`,
  //       });
  //             slots.push({ hour, minute: 30, display: this.formatSlot(hour, 30), value: `${hour}:30:00` });

  //     }
  //     // From midnight to end
  //     for (let hour = 0; hour < endHour; hour++) {
  //       slots.push({
  //         hour,
  //         display: this.formatHour(hour),
  //         value: `${hour}:00:00`,
  //       });
  //     }
  //   } else {
  //     // Normal shift
  //     for (let hour = startHour; hour < endHour; hour++) {
  //       slots.push({
  //         hour,
  //         display: this.formatHour(hour),
  //         value: `${hour}:00:00`,
  //       });
  //     }
  //   }

  //   return slots;
  // }
  private generateTimeSlots(startHour: number, endHour: number) {
    const slots: TimeSlot[] = [];
    const generate = (start: number, end: number) => {
      for (let hour = start; hour < end; hour++) {
        slots.push({
          hour,
          minute: 0,
          display: this.formatSlot(hour, 0),
          value: `${hour}:00:00`,
        });
        slots.push({
          hour,
          minute: 30,
          display: this.formatSlot(hour, 30),
          value: `${hour}:30:00`,
        });
      }
    };

    if (startHour > endHour) {
      generate(startHour, 24);
      generate(0, endHour);
    } else {
      generate(startHour, endHour);
    }

    return slots;
  }

  private formatSlot(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute === 0 ? '00' : '30'} ${period}`;
  }

  async validateBookingSlot(
    date: string,
    consultantId: string,
    bookingIdToExclude?: string,
  ) {
    const bookingDate = this.parseBookingDate(date);
    // Check for bookings in the same hour
    const slotStart = new Date(bookingDate);

    const slotEnd = new Date(bookingDate);

    slotEnd.setMinutes(slotEnd.getMinutes() + 29, 59, 999);

    const conditions = [
      eq(bookingTable.consultantId, consultantId),
      gte(bookingTable.date, slotStart),
      lte(bookingTable.date, slotEnd),
      eq(bookingTable.paymentStatus, true),
    ];

    if (bookingIdToExclude) {
      conditions.push(ne(bookingTable.id, bookingIdToExclude));
    }

    const [existingBooking] =
      await this.bookingRepository.findBookingsByConditions(conditions);

    const displayTime = bookingDate.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    });

    if (existingBooking) {
      throw new BadRequestException(
        `Time slot at ${displayTime} is already booked`,
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
    return await this.bookingRepository.totalBookings(patientId);
  }

  // ! patient cancels appointment

  async cancelAppointment(bookingId: string, patientId: string) {
    const booking = await this.bookingRepository.cancelAppointment(
      bookingId,
      patientId,
    );
    if (!booking)
      throw new InternalServerErrorException(
        'An error occured while cancelling bookings',
      );
    return booking;
  }
  // !consultant starts appointment

  async consultantStartAppointment(bookingId: string, consultantId: string) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      consultantId,
    );
    if (!booking || booking.consultantId !== consultantId) {
      throw new ForbiddenException('Not authorized');
    }

    if (booking.status !== 'upcoming') {
      return;
      throw new BadRequestException('Appointment already started or completed');
    }
    if (booking.status !== 'cancelled') {
      return;
      throw new BadRequestException('You cannot start a cancelled appointment');
    }

    return await this.bookingRepository.consultantStartAppointment(
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
    if (!booking || booking.consultantId !== consultantId) {
      throw new ForbiddenException('Not authorized');
    }

    if (booking.status !== 'in_progress') {
      throw new BadRequestException('Appointment not in progress');
    }

    const completeBookings =
      await this.bookingRepository.consultantCompleteAppointment(
        {
          consultationNotes: notes,
        },
        bookingId,
        consultantId,
      );

    const consultant =
      await this.consultantRepository.findApprovedConsultantById(consultantId);

    if (!consultant) throw new NotFoundException('Consultant not found');

    this.oneSignalService.sendNotificationToUser(
      booking.patientId,
      `Appointment completion comfirmation`,
      `Please, verify the completion of your appointment with ${consultant.fullName}`,
      {
        category: 'Appointment',
      },
    );

    return completeBookings;

    // TODO: Send notification to patient to confirm
  }

  // ! patient confirms consultant completion
  async patientCompleteAppointment(
    bookingId: string,
    patientId: string,
    confirmed: boolean,
    reason?: string,
  ) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      undefined,
      patientId,
    );

    console.log(patientId, bookingId, booking);
    if (!booking || booking.patientId !== patientId) {
      throw new ForbiddenException('Not authorized');
    }

    if (booking.status !== 'pending_confirmation') {
      throw new BadRequestException(
        'Appointment not pending confirmation, the consultant first has to comfirm the completion of the appointment ',
      );
    }

    const newStatus = confirmed ? 'completed' : 'disputed';

    return await this.bookingRepository.patientCompleteAppointment(
      {
        status: newStatus,
        patientConfirmed: confirmed,
        disputeReason: confirmed ? null : reason,
      },
      bookingId,
      patientId,
    );

    // TODO: If disputed, notify admin/support
  }

  //! Consultant marks patient as no-show
  async consultantMarkNoShow(bookingId: string, consultantId: string) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      consultantId,
    );
    if (!booking || booking.consultantId !== consultantId) {
      throw new ForbiddenException('Not authorized');
    }

    console.log(booking);

    if (booking.status !== 'in_progress' && booking.status !== 'upcoming') {
      throw new BadRequestException(
        'Can only mark no show if appointment is upcoming or in progress',
      );
    }

    return await this.bookingRepository.consultantMarkNoShow(
      bookingId,
      consultantId,
    );
  }
  async patientMarkNoShow(bookingId: string, patientId: string) {
    const booking = await this.bookingRepository.getBooking(
      bookingId,
      undefined,
      patientId,
    );

    if (!booking || booking.patientId !== patientId) {
      throw new ForbiddenException('Not authorized');
    }

    //! consultant Can only mark no-show if  in_progress
    if (!['upcoming'].includes(booking.status)) {
      throw new BadRequestException(
        'Can only mark as no show if the appointment is upcoming!',
      );
    }

    return await this.bookingRepository.patientMarkNoShow(bookingId, patientId);
  }

  async getPatientAllBookings(query: QueryBookingDto, patientId: string) {
    return await this.bookingRepository.getPatientAllBookings(query, patientId);
  }

  //! Cron job: Auto-complete if patient doesn't respond within 24hrs
  @Cron(CronExpression.EVERY_HOUR)
  async autoCompleteStaleAppointments() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await this.bookingRepository.updateBookingAfterInterval(
      twentyFourHoursAgo,
    );
  }

  // ! send reminder notification for appointment
  @Cron(CronExpression.EVERY_MINUTE)
  async sendReminderNotificationForAppointment() {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    const elevenMinutesFromNow = new Date(now.getTime() + 11 * 60 * 1000);

    // grab all upcoming bookings in the 10-11 minute window
    const upcomingBookings =
      await this.bookingRepository.getTenMinutesBookingFronNow(
        tenMinutesFromNow,
        elevenMinutesFromNow,
      );

    if (!upcomingBookings.length) return;

    await Promise.all(
      upcomingBookings.map(async (booking) => {
        // get consultant name for the notification message
        const consultant =
          await this.consultantRepository.findApprovedConsultantById(
            booking.consultantId,
          );

        await Promise.all([
          // notify patient
          this.oneSignalService.sendNotificationToUser(
            booking.patientId,
            'Appointment Reminder 🔔',
            `Your appointment with ${consultant.fullName} starts in 10 minutes`,
            { category: 'Appointment' },
          ),
          // notify consultant too
          this.oneSignalService.sendNotificationToUser(
            booking.consultantId,
            'Appointment Reminder 🔔',
            `You have an appointment starting in 10 minutes`,
            { category: 'Appointment' },
          ),
        ]);
      }),
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM) // fires once daily at 8am
  async handleFollowUpNotifications() {
    const now = new Date();

    // 2-day window (full day, 2 days ago)
    const twoDaysAgoStart = new Date(now);
    twoDaysAgoStart.setDate(now.getDate() - 2);
    twoDaysAgoStart.setHours(0, 0, 0, 0);

    const twoDaysAgoEnd = new Date(twoDaysAgoStart);
    twoDaysAgoEnd.setHours(23, 59, 59, 999);

    // 7-day window (full day, 7 days ago)
    const sevenDaysAgoStart = new Date(now);
    sevenDaysAgoStart.setDate(now.getDate() - 7);
    sevenDaysAgoStart.setHours(0, 0, 0, 0);

    const sevenDaysAgoEnd = new Date(sevenDaysAgoStart);
    sevenDaysAgoEnd.setHours(23, 59, 59, 999);

    const [twoDayBookings, sevenDayBookings] = await Promise.all([
      this.bookingRepository.getTwoDaysCompletedBookings(
        twoDaysAgoStart,
        twoDaysAgoEnd,
      ),
      this.bookingRepository.getSevenDaysCompletedBookings(
        sevenDaysAgoStart,
        sevenDaysAgoEnd,
      ),
    ]);

    // 2-day follow-ups
    await Promise.all(
      twoDayBookings.map(async (booking: any) => {
        const patient = await this.userRepository.findUserById(
          booking.patientId,
        );
        const consultant = await this.userRepository.findUserById(
          booking.consultantId,
        );

        await this.oneSignalService.sendNotificationToUser(
          booking.patientId,
          'Two days On — How Is Your Recovery Going?',
          `Hi ${patient.fullName.split(' ')[0]}, it's been 2 days since your consultation with Dr. ${consultant.fullName}. How are you feeling?`,
          { category: 'FollowUp', bookingId: booking.id },
        );

        await this.emailService.queueTemplatedEmail(
          EmailTemplateType.TWO_DAY_FOLLOW_UP,
          patient.email,
          {
            patientName: patient.fullName,
            doctorName: consultant.fullName,
            consultationDate: booking.date,
          },
        );
      }),
    );

    // 7-day follow-ups
    await Promise.all(
      sevenDayBookings.map(async (booking: any) => {
        const patient = await this.userRepository.findUserById(
          booking.patientId,
        );
        const consultant = await this.userRepository.findUserById(
          booking.consultantId,
        );


          await this.oneSignalService.sendNotificationToUser(
            booking.patientId,
            'One Week On — How Is Your Recovery Going?',
            `Hi ${patient.fullName.split(' ')[0]}, it's been 7 days since your consultation with Dr. ${consultant.fullName}. How are you feeling?`,
            { category: 'FollowUp', bookingId: booking.id },
          );
        await this.emailService.queueTemplatedEmail(
          EmailTemplateType.SEVEN_DAY_FOLLOW_UP,
          patient.email,
          {
            patientName: patient.fullName,
            doctorName: consultant.fullName,
            consultationDate: booking.date,
          },
        );
      }),
    );
  }

  //! end of appointment crons

  async listBookingsByFilter(query: QueryBookingDto) {
    const bookings = await this.bookingRepository.listBookingsByFilter(query);

    return bookings;
  }
}
