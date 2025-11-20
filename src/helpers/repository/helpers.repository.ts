import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";


@Injectable()

export class HelperRepository {
    constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import("@src/db")>){}

    async executeInTransaction<T>(
        callback: (trx: any) => Promise<T>,
    ): Promise<T> {
        return await this.DbProvider.transaction(async (trx) => {
            return await callback(trx);
        });
    }
}