import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { consultantTable, userTable } from "@src/db";
import { eq, ilike, or } from "drizzle-orm";
import { UpdateConsultantDto } from "@src/consultant/dto/updateConsultantDto";


@Injectable()
export class ConsultantRepository {
    constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>) { }

    async createConsultant(userId: string, trx?: any) {
        const Trx = trx || this.DbProvider
        const [consultant] = await Trx.insert(consultantTable).values({ userId }).returning();

        return consultant;
    }


    async updateConsultant(data: UpdateConsultantDto, userId: string, trx?: any) {
        const Trx = trx || this.DbProvider;
        const [consultant] = await Trx.update(consultantTable).set(data).where(eq(consultantTable.userId, userId)).returning();

        return consultant;
    }

    
    async findConsultantById(userId: string) {
        const [consultant] = await this.DbProvider.select().from(consultantTable).where(eq(consultantTable.userId, userId));

        return consultant;
    }

   


    async findConsultantByNameOrSpeciality(searchTerm: string) {
        const consultants = await this.DbProvider
            .select({
                id: consultantTable.id,
                userId: consultantTable.userId,
                availability: consultantTable.availability,
                speciality: consultantTable.speciality,
                yrsOfExperience: consultantTable.yrsOfExperience,
                about: consultantTable.about,
                languages: consultantTable.languages,
                education: consultantTable.education,
                certification: consultantTable.certification,
                workingHours: consultantTable.workingHours,
                pricePerSession: consultantTable.pricePerSession,
                // User details
                userName: userTable.fullName,
                userEmail: userTable.email,
                userProfilePicture: userTable.dp,
                dateCreated: userTable.createdAt
            })
            .from(consultantTable)
            .leftJoin(userTable, eq(consultantTable.userId, userTable.id))
            .where(
                or(
                    ilike(userTable.fullName, `%${searchTerm}%`),
                    ilike(consultantTable.speciality, `%${searchTerm}%`)
                )
            );

        return consultants;
    }

}