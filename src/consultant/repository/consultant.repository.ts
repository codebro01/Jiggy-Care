import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { consultantTable } from "@src/db";
import { eq } from "drizzle-orm";
import { UpdateConsultantDto } from "@src/consultant/dto/updateConsultantDto";


@Injectable()
export class ConsultantRepository {
    constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>) { }

    async createConsultant(userId: string, trx?: any) {
        const Trx = trx || this.DbProvider
        const [consultant] = await Trx.insert(consultantTable).values({ userId }).returning();

        return consultant;
    }


    async updateConsultant(data: UpdateConsultantDto, userId: string, trx?:any) {
        const Trx = trx || this.DbProvider;
        const [consultant] = await Trx.update(consultantTable).set(data).where(eq(consultantTable.userId, userId)).returning();

        return consultant;
    }
    async findConsultant(userId: string) {
        const [consultant] = await this.DbProvider.select().from(consultantTable).where(eq(consultantTable.userId, userId));

        return consultant;
    }
}