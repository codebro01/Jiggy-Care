import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  healthMonitoringTable,
  healthMonitoringTableInsertType,
} from '@src/db/health-monitoring';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
import { userTable } from '@src/db/users';

@Injectable()
export class HealthMonitoringRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createHealthReading(data: healthMonitoringTableInsertType) {
    const [healthReading] = await this.DbProvider.insert(healthMonitoringTable)
      .values({...data, bloodPressure: [data.bloodPressure]})
      .returning();

    return healthReading;
  }

  async findHealthReadingById(id: string) {
    const [healthReading] = await this.DbProvider.select()
      .from(healthMonitoringTable)
      .where(eq(healthMonitoringTable.id, id))
      .leftJoin(userTable, eq(userTable.id, healthMonitoringTable.patientId));

    return healthReading;
  }

  async findHealthReadingsByPatient(patientId: string) {
    const [healthReadings] = await this.DbProvider.select({
      id: healthMonitoringTable.id,
      patientId: healthMonitoringTable.patientId,
      bloodPressure: healthMonitoringTable.bloodPressure,
      temperature: healthMonitoringTable.temperature,
      heartRate: healthMonitoringTable.heartRate,
      weight: healthMonitoringTable.weight,
      createdAt: healthMonitoringTable.createdAt,
      updatedAt: healthMonitoringTable.updatedAt,
    })
      .from(healthMonitoringTable)
      .where(eq(healthMonitoringTable.patientId, patientId))
      .orderBy(desc(healthMonitoringTable.createdAt));

    return healthReadings;
  }

  async updateHealthReading(
    patientId: string,
    data: Partial<healthMonitoringTableInsertType>,
  ) {
    const existingRecord = await this.findHealthReadingsByPatient(patientId)

    if (!existingRecord) {
      throw new NotFoundException('Health reading not found');
    }

    const updateData: Partial<healthMonitoringTableInsertType> = {
      ...data,
      updatedAt: new Date(),
    };

    console.log({ ...data.bloodPressure });

    if (data.bloodPressure) {
      const currentReadings = existingRecord.bloodPressure || [];
      updateData.bloodPressure = [...currentReadings, data.bloodPressure];
    }

    const [healthReading] = await this.DbProvider.update(healthMonitoringTable)
      .set(updateData)
      .where(
        and(
          eq(healthMonitoringTable.patientId, patientId),
        ),
      )
      .returning();

    return healthReading;
  }

  async deleteHealthReading(id: string, patientId: string) {
    const [healthReading] = await this.DbProvider.delete(healthMonitoringTable)
      .where(
        and(
          eq(healthMonitoringTable.id, id),
          eq(healthMonitoringTable.patientId, patientId),
        ),
      )
      .returning();

    return healthReading;
  }

  async findAllHealthReadings() {
    const healthReadings = await this.DbProvider.select()
      .from(healthMonitoringTable)
      .leftJoin(userTable, eq(userTable.id, healthMonitoringTable.patientId))
      .orderBy(desc(healthMonitoringTable.createdAt));

    return healthReadings;
  }

  async findLatestReadingByPatient(patientId: string) {
    const [latestReading] = await this.DbProvider.select()
      .from(healthMonitoringTable)
      .where(eq(healthMonitoringTable.patientId, patientId))
      .orderBy(desc(healthMonitoringTable.createdAt))
      .limit(1);

    return latestReading;
  }

  async bloodPressureTrends() {
    
  }
}
