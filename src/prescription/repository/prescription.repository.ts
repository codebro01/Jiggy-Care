import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or, and } from 'drizzle-orm';
import { CreatePrescriptionDto } from '@src/prescription/dto/create-prescription.dto';
import { UpdatePrescriptionDto } from '@src/prescription/dto/update-prescription.dto';
import { prescriptionTable } from '@src/db';

@Injectable()
export class PrescriptionRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async create(
    data: CreatePrescriptionDto,
    consultantId: string,
    patientId: string,
  ) {
    const [prescription] = await this.DbProvider.insert(prescriptionTable)
      .values({
        ...data,
        patientId,
        consultantId,
        status: data.status || 'active',
      })
      .returning();

    return prescription;
  }

  async findAll(consultantId?: string, patientId?: string) {
    if (!consultantId && !patientId)
      throw new BadRequestException(
        'Please provide either a consultant or a patient Id',
      );

    const condition = [];

    if (patientId) condition.push(eq(prescriptionTable.patientId, patientId));
    if (consultantId)
      condition.push(eq(prescriptionTable.consultantId, consultantId));

    return await this.DbProvider.select()
      .from(prescriptionTable)
      .where(or(...condition));
  }

  async findOne(id: string) {
    const [prescription] = await this.DbProvider.select()
      .from(prescriptionTable)
      .where(eq(prescriptionTable.id, id));

    return prescription;
  }

  async findByStatus(status: string) {
    return await this.DbProvider.select()
      .from(prescriptionTable)
      .where(eq(prescriptionTable.status, status));
  }

  async update(
    prescriptionId: string,
    updateDto: UpdatePrescriptionDto,
    consultantId: string,
  ) {
    const [prescription] = await this.DbProvider.update(prescriptionTable)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(prescriptionTable.id, prescriptionId),
          eq(prescriptionTable.consultantId, consultantId),
        ),
      )
      .returning();

    return prescription;
  }

  async delete(id: string) {
    const [prescription] = await this.DbProvider.delete(prescriptionTable)
      .where(eq(prescriptionTable.id, id))
      .returning();

    return prescription;
  }

  async updatePillsRemaining(
    prescriptionId: string,
    pillsRemaining: number,
    patientId: string,
  ) {
    const [prescription] = await this.DbProvider.update(prescriptionTable)
      .set({
        pillsRemaining,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(prescriptionTable.id, prescriptionId),
          eq(prescriptionTable.patientId, patientId),
        ),
      )
      .returning();

    return prescription;
  }
}
