import { Injectable, NotFoundException } from '@nestjs/common';
import { MedicationRepository } from './repository/medication.repository';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { QueryMedicationDto } from './dto/query-medication.dto';

@Injectable()
export class MedicationService {
  constructor(private readonly medicationRepository: MedicationRepository) {}

  async create(createMedicationDto: CreateMedicationDto) {
    return await this.medicationRepository.create(createMedicationDto);
  }

  async findAll(query: QueryMedicationDto) {
    return await this.medicationRepository.findAll(query);
  }

  async findOne(id: string) {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }
    return medication;
  }

  async update(id: string, updateMedicationDto: UpdateMedicationDto) {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }
    return await this.medicationRepository.update(id, updateMedicationDto);
  }

  async remove(id: string) {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }
    return await this.medicationRepository.delete(id);
  }
}
