import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { consultantTable } from "@src/db";
import { eq } from "drizzle-orm";
import { UpdateConsultantDto } from "@src/consultant/dto/updateUserDto";


@Injectable()
export class ConsultantRepository {
    constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>) { }

    async updateConsultant(data: UpdateConsultantDto, userId: string) {
        const [consultant] = await this.DbProvider.update(consultantTable).set(data).where(eq(consultantTable.userId, userId)).returning();

        return consultant;
    }
    async findConsultant(userId: string) {
        const [consultant] = await this.DbProvider.select().from(consultantTable).where(eq(consultantTable.userId, userId));

        return consultant;
    }
}