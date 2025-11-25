import { Inject, Injectable } from '@nestjs/common';
import {  ratingTable } from '@src/db/rating';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateRatingDto } from '@src/rating/dto/createRatingDto';
import { eq } from 'drizzle-orm';
import { userTable } from '@src/db';

@Injectable()
export class RatingRepository {
    constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>) { }

 
    async createRating(data: CreateRatingDto, patientId: string, consultantId: string) {
        const [rating] = await this.DbProvider.insert(ratingTable).values({ ...data, patientId, consultantId }).returning();

        return rating;

        
    }

    async findConsultantRatings(consultantId: string) {
         const rating = await this.DbProvider.select().from(ratingTable).where(eq(ratingTable.consultantId, consultantId)).leftJoin(userTable, eq(userTable.id, consultantId));

         return rating; 
    }
}
