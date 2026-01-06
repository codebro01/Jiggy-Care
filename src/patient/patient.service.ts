import { Injectable } from '@nestjs/common';
import { QueryPatientsDto } from '@src/patient/dto/query-patients.dto';
import { PatientRepository } from '@src/patient/repository/patient.repository';

@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async listAllPatients(query: QueryPatientsDto) {
   
    const patients = await this.patientRepository.listAllPatients(query)

    return patients;
  }
}
