import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { bookingTable } from "@src/db/booking";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CreateBookingDto } from "../dto/createBooking.dto";
import { or, eq, and } from "drizzle-orm";

@Injectable()

export class BookingRepository {
    constructor(@Inject("DB") private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>) { }


    // ! create bookings 
    async createBooking(data: CreateBookingDto, patientId: string, consultantId: string, trx: any) {
        const Trx = trx || this.DbProvider;

        const [booking] = await Trx.insert(bookingTable).values(data).returning();

        return booking;
    }

    // ! get booking 
    async getBooking(bookingId: string, consultantId?: string, patientId?: string, trx?: any) {
        const Trx = trx || this.DbProvider;

        if(!consultantId && !patientId) throw new BadRequestException('Please provide either a patient or a consultant identity')

        const conditions = [];

        if (consultantId) conditions.push(eq(bookingTable.consultantId, consultantId))

        if (patientId) conditions.push(eq(bookingTable.patientId, patientId))

        const [booking] = await Trx.select().from(bookingTable).where(and(eq(bookingTable.id, bookingId), or(...conditions))).limit(1);
        return booking;
    }

    async getBookings(consultantId?: string, patientId?: string, trx?: any) {
        const Trx = trx || this.DbProvider;

        if(!consultantId && !patientId) throw new BadRequestException('Please provide either a patient or a consultant identity')

            const conditions = [];

            if(consultantId) conditions.push(eq(bookingTable.consultantId, consultantId))

            if(patientId) conditions.push(eq(bookingTable.patientId, patientId))

        const [booking] = await Trx.select().from(bookingTable).where(...conditions);
        return booking;
    }
}