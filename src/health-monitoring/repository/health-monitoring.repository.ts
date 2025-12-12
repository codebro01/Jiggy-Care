import { Inject, Injectable } from '@nestjs/common';
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
      .values(data)
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
    const healthReadings = await this.DbProvider.select()
      .from(healthMonitoringTable)
      .where(eq(healthMonitoringTable.patientId, patientId))
      .orderBy(desc(healthMonitoringTable.createdAt));

    return healthReadings;
  }

  async updateHealthReading(
    id: string,
    patientId: string,
    data: Partial<healthMonitoringTableInsertType>,
  ) {
    const [healthReading] = await this.DbProvider.update(healthMonitoringTable)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(healthMonitoringTable.id, id),
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
}
