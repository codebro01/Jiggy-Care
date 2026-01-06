import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { patientTable } from "@src/db";
import { eq } from "drizzle-orm";
import { UpdatePatientDto } from "@src/patient/dto/updatePatientDto";
import { QueryPatientsDto } from "@src/patient/dto/query-patients.dto";


@Injectable()
export class PatientRepository {
    constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>) { }

    async createPatient(userId: string, trx?: any) {
        const Trx = trx || this.DbProvider
        const [patient] = await Trx.insert(patientTable).values({ userId }).returning();

        return patient;
    }


    async updatePatient(data: UpdatePatientDto, userId: string, trx?:any) {
        const Trx = trx || this.DbProvider;
        const [patient] = await Trx.update(patientTable).set(data).where(eq(patientTable.userId, userId)).returning();

        return patient;
    }
    async findPatient(userId: string) {
        const [patient] = await this.DbProvider.select().from(patientTable).where(eq(patientTable.userId, userId));

        return patient;
    }

    async listAllPatients(query: QueryPatientsDto) {
         const limit = query.limit || 10;
            const page =  query.page || 1;
        
            const offset = (page - 1) * limit
              const patients = await this.DbProvider.select().from(patientTable).limit(limit).offset(offset)
        
              return patients;
    }
}