import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { HealthMonitoringRepository } from './repository/health-monitoring.repository';
import { CreateHealthReadingDto } from '@src/health-monitoring/dto/create-health-monitoring.dto';
import { UpdateHealthReadingDto } from '@src/health-monitoring/dto/update-health-monitoring.dto';
import { readingStatusType } from '@src/db/health-monitoring';


export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  status?: readingStatusType;
  note?: string;
  date: string; // ISO date string
}
@Injectable()
export class HealthMonitoringService {
  constructor(
    private readonly healthMonitoringRepository: HealthMonitoringRepository,
  ) {}

  async createHealthReading(
    createDto: CreateHealthReadingDto,
    patientId: string,
  ) {
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

    if (!healthReadings) {
      return null;
    }

        const bloodPressureReadings =
          healthReadings.bloodPressure as BloodPressureReading[];

    let latestBloodPressure = null;
    if (bloodPressureReadings && bloodPressureReadings.length > 0) {
      latestBloodPressure = [...bloodPressureReadings].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0];
    }

    return {
      ...healthReadings,
      bloodPressure: latestBloodPressure,
    };
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
    patientId: string,
    updateDto: UpdateHealthReadingDto,
  ) {
    const existingReading =
      await this.healthMonitoringRepository.findHealthReadingsByPatient(
        patientId,
      );

    if (!existingReading) {
      if (updateDto.bloodPressure)
        updateDto.bloodPressure = {
          ...updateDto.bloodPressure,
          date: new Date().toISOString(),
        };
      const healthReading =
        await this.healthMonitoringRepository.createHealthReading({
          patientId: patientId,
          temperature: updateDto.temperature as any,
          heartRate: updateDto.heartRate as any,
          weight: updateDto.weight as any,
          bloodPressure: updateDto.bloodPressure as any,
        });

      return healthReading;
    }

    if (existingReading.patientId !== patientId) {
      throw new ForbiddenException(
        'You are not authorized to update this health reading',
      );
    }

    const updateData: any = {};
    if (updateDto.temperature) updateData.temperature = updateDto.temperature;
    if (updateDto.heartRate) updateData.heartRate = updateDto.heartRate;
    if (updateDto.weight) updateData.weight = updateDto.weight;
    if (updateDto.bloodPressure)
      updateData.bloodPressure = {
        ...updateDto.bloodPressure,
        date: new Date(),
      };
    console.log(updateData.bloodPressure);

    const updatedReading =
      await this.healthMonitoringRepository.updateHealthReading(
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

  async getBloodPressureTrend(patientId: string, days: number = 7) {
    // Get the patient's health record
    const record =
      await this.healthMonitoringRepository.findHealthReadingsByPatient(
        patientId,
      );

    if (!record || !record.bloodPressure || record.bloodPressure.length === 0) {
      return {
        readings: [],
        period: `last_${days}_days`,
      };
    }
    const bloodPressureReadings =
      record.bloodPressure as BloodPressureReading[];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0); // Start of day

    const filteredReadings = bloodPressureReadings
      .filter((reading) => {
        const readingDate = new Date(reading.date);
        return readingDate >= cutoffDate;
      })
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    return {
      readings: filteredReadings,
      period: `last_${days}_days`,
    };
  }
}
