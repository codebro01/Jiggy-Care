import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { HealthMonitoringRepository } from './repository/health-monitoring.repository';
import { CreateHealthReadingDto } from '@src/health-monitoring/dto/create-health-monitoring.dto';
import { UpdateHealthReadingDto } from '@src/health-monitoring/dto/update-health-monitoring.dto';
@Injectable()
export class HealthMonitoringService {
  constructor(
    private readonly healthMonitoringRepository: HealthMonitoringRepository,
  ) {}

  async createHealthReading(createDto: CreateHealthReadingDto, patientId: string) {
    const healthReading =
      await this.healthMonitoringRepository.createHealthReading({
        patientId: patientId,
        temperature: createDto.temperature as any,
        heartRate: createDto.heartRate as any,
        weight: createDto.weight as any,
        bloodPressure: createDto.bloodPressure as any,
      });

    return healthReading;
  }

  async getHealthReadingById(id: string) {
    const healthReading =
      await this.healthMonitoringRepository.findHealthReadingById(id);

    if (!healthReading) {
      throw new NotFoundException('Health reading not found');
    }

    return healthReading;
  }

  async getHealthReadingsByPatient(patientId: string) {
    const healthReadings =
      await this.healthMonitoringRepository.findHealthReadingsByPatient(
        patientId,
      );
    return healthReadings;
  }

  async getLatestReadingByPatient(patientId: string) {
    const latestReading =
      await this.healthMonitoringRepository.findLatestReadingByPatient(
        patientId,
      );

    if (!latestReading) {
      throw new NotFoundException('No health readings found for this patient');
    }

    return latestReading;
  }

  async getAllHealthReadings() {
    const healthReadings =
      await this.healthMonitoringRepository.findAllHealthReadings();
    return healthReadings;
  }

  async updateHealthReading(
    id: string,
    patientId: string,
    updateDto: UpdateHealthReadingDto,
  ) {
    const existingReading =
      await this.healthMonitoringRepository.findHealthReadingById(id);

    if (!existingReading) {
      throw new NotFoundException('Health reading not found');
    }

    if (existingReading.health_monitoring.patientId !== patientId) {
      throw new ForbiddenException(
        'You are not authorized to update this health reading',
      );
    }

    const updateData: any = {};
    if (updateDto.temperature) updateData.temperature = updateDto.temperature;
    if (updateDto.heartRate) updateData.heartRate = updateDto.heartRate;
    if (updateDto.weight) updateData.weight = updateDto.weight;
    if (updateDto.bloodPressure)
      updateData.bloodPressure = updateDto.bloodPressure;

    const updatedReading =
      await this.healthMonitoringRepository.updateHealthReading(
        id,
        patientId,
        updateData,
      );

    if (!updatedReading) {
      throw new NotFoundException(
        'Health reading not found or you are not authorized',
      );
    }

    return updatedReading;
  }

  async deleteHealthReading(id: string, patientId: string) {
    const existingReading =
      await this.healthMonitoringRepository.findHealthReadingById(id);

    if (!existingReading) {
      throw new NotFoundException('Health reading not found');
    }

    if (existingReading.health_monitoring.patientId !== patientId) {
      throw new ForbiddenException(
        'You are not authorized to delete this health reading',
      );
    }

    const deletedReading =
      await this.healthMonitoringRepository.deleteHealthReading(id, patientId);

    if (!deletedReading) {
      throw new NotFoundException(
        'Health reading not found or you are not authorized',
      );
    }

    return {
      message: 'Health reading deleted successfully',
      data: deletedReading,
    };
  }
}
