import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()

export class BookingRepository {
    constructor(@Inject("DB") private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>){}


    async createBooking() {
        
    }
}