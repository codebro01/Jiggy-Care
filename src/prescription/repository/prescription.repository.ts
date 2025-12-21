import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or, and } from 'drizzle-orm';
import { CreatePrescriptionDto } from '@src/prescription/dto/create-prescription.dto';
import { UpdatePrescriptionDto } from '@src/prescription/dto/update-prescription.dto';
import {  prescriptionTable } from '@src/db';

@Injectable()
export class PrescriptionRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async create(
    data: CreatePrescriptionDto & {prescribedBy: string},
    consultantId: string,
    patientId: string,
  ) {
    const [prescription] = await this.DbProvider.insert(prescriptionTable)
      .values({
        ...data,
        patientId,
        consultantId,
        pillsRemaining: data.totalPills, 
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

    const query = this.DbProvider.select()
      .from(prescriptionTable)
      .where(or(...condition));

      // if(consultantId) query.leftJoin(consultantTable, eq(consultantTable.userId, consultantId))
      // if(patientId) query.leftJoin(patientTable, eq(patientTable.userId, patientId))

      return await query;
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
    data: UpdatePrescriptionDto,
    consultantId: string,
  ) {

    const prevPrescription = await this.findOne(prescriptionId);

    if(!prevPrescription) throw new BadRequestException('Could not update prescription')

    if(!data.patientId) throw new BadRequestException('Please provide patient id')
    const [prescription] = await this.DbProvider.update(prescriptionTable)
      .set({
        name: data.name || prevPrescription.name, 
        dosage: data.dosage || prevPrescription.dosage, 
        frequency: data.frequency || prevPrescription.frequency, 
        pillsRemaining: data.pillsRemaining || prevPrescription.pillsRemaining, 
        totalPills: data.totalPills || prevPrescription.totalPills, 
        startDate: data.startDate || prevPrescription.startDate, 
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(prescriptionTable.id, prescriptionId),
          eq(prescriptionTable.consultantId, consultantId),
          eq(prescriptionTable.patientId, data.patientId),
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
