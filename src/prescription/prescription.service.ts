import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionRepository } from './repository/prescription.repository';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { UserRepository } from '@src/users/repository/user.repository';

@Injectable()
export class PrescriptionService {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(
    data: CreatePrescriptionDto,
    consultantId: string,
    patientId: string,
  ) {
    const startDate = new Date(data.startDate);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today)
      throw new BadRequestException('start date cannot be in the past');

    const prescribedBy = await this.userRepository.findUserById(consultantId);

    if (!prescribedBy) throw new BadRequestException('Invalid consultant');

    return await this.prescriptionRepository.create(
      { ...data, prescribedBy: prescribedBy.fullName },
      consultantId,
      patientId,
    );
  }

  async findAll(consultantId?: string, patientId?: string) {
    const prescriptions = await this.prescriptionRepository.findAll(
      consultantId,
      patientId,
    );

    const daysToFrequency = {
      once_daily: 1,
      twice_daily: 2,
      thrice_daily: 3,
      four_times_daily: 4,
      five_times_daily: 5,
      often: 6,
    };

    const calculate = prescriptions.map((prescription) => {
      const dosage = prescription.prescriptions.dosage;
      const totalPills = prescription.prescriptions.totalPills;
      const startDate = new Date(prescription.prescriptions.startDate);
      const frequency = prescription.prescriptions.frequency;
      const today = new Date();

      const totalPillsDaily = dosage * daysToFrequency[frequency];

      const totalDays = totalPills / totalPillsDaily;

      const finishDate = new Date(startDate);
      finishDate.setDate(finishDate.getDate() + totalDays);

      const hasStarted = today >= startDate;

      let daysPassed = 0;
      let pillsConsumed = 0;
      let remainingPills = totalPills;
      let daysRemaining = totalDays;
      let isFinished = false;

      if (hasStarted) {
        daysPassed = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        pillsConsumed = daysPassed * totalPillsDaily;

        remainingPills = Math.max(0, totalPills - pillsConsumed);

        daysRemaining = remainingPills / totalPillsDaily;

        isFinished = remainingPills === 0 || today >= finishDate;
      } else {
        daysPassed = 0;
        pillsConsumed = 0;
        remainingPills = totalPills;
        daysRemaining = totalDays;
        isFinished = false;
      }

      return {
        ...prescription,
        totalPillsDaily,
        totalDays,
        finishDate,
        hasStarted,
        daysPassed,
        pillsConsumed,
        remainingPills,
        daysRemaining,
        isFinished,
      };
    });

    return calculate;
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

    console.log('updated');

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

  async takePill(prescriptionId: string, patientId: string) {
    const prescription = await this.findOne(prescriptionId);

    if (prescription.pillsRemaining <= 0) {
      throw new NotFoundException('No pills remaining');
    }

    if (prescription.pillsRemaining < prescription.dosage)
      throw new NotFoundException(
        'You no longer have enough pills, please re-fill',
      );
    const newPillsRemaining = prescription.pillsRemaining - prescription.dosage;

    return await this.prescriptionRepository.updatePillsRemaining(
      prescriptionId,
      newPillsRemaining,
      patientId,
    );
  }

  async getActivePrescription() {
    return await this.findByStatus('active');
  }

  async totalActivePresciptions(patientId: string): Promise<number> {
    return await this.prescriptionRepository.totalActivePresciptions(patientId);
  }
}
