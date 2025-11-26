import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionRepository } from './repository/prescription.repository';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
  ) {}

  async create(
    data: CreatePrescriptionDto,
    consultantId: string,
    patientId: string,
  ) {
    return await this.prescriptionRepository.create(
      data,
      consultantId,
      patientId,
    );
  }

  async findAll(consultantId?: string, patientId?: string) {
    return await this.prescriptionRepository.findAll(consultantId, patientId);
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionRepository.findOne(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async findByStatus(status: string) {
    return await this.prescriptionRepository.findByStatus(status);
  }

  async update(
    prescriptionId: string,
    updatePrescriptionDto: UpdatePrescriptionDto,
    consultantId: string,
  ) {
    await this.findOne(prescriptionId);

    const updated = await this.prescriptionRepository.update(
      prescriptionId,
      updatePrescriptionDto,
      consultantId,
    );

    if (!updated) {
      throw new NotFoundException(
        `Failed to update prescription with ID ${prescriptionId}`,
      );
    }

    return updated;
  }

  async delete(id: string) {
    await this.findOne(id);

    const deleted = await this.prescriptionRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(
        `Failed to delete prescription with ID ${id}`,
      );
    }

    return { message: 'Prescription deleted successfully', data: deleted };
  }

  async takePill(prescriptionId: string, dosage: number, patientId: string) {
    const prescription = await this.findOne(prescriptionId);

    if (prescription.pillsRemaining <= 0) {
      throw new Error('No pills remaining');
    }

    if (prescription.pillsRemaining < dosage)
      throw new BadRequestException(
        'You no longer have enough pills, please re-fill',
      );
    const newPillsRemaining = prescription.pillsRemaining - dosage;

    return await this.prescriptionRepository.updatePillsRemaining(
      prescriptionId,
      newPillsRemaining,
      patientId,
    );
  }

  async getActivePrescription() {
    return await this.findByStatus('active');
  }
}
