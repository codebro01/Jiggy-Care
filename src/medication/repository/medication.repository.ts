import { Inject, Injectable } from '@nestjs/common';
import { eq, like, and, sql, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { medicationTable } from '@src/db/medication';
import { CreateMedicationDto } from '../dto/create-medication.dto';
import { UpdateMedicationDto } from '../dto/update-medication.dto';
import { QueryMedicationDto } from '@src/medication/dto/query-medication.dto';

@Injectable()
export class MedicationRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async create(data: CreateMedicationDto) {
    const [medication] = await this.DbProvider.insert(medicationTable)
      .values({
        ...data,
        price: data.price,
        rating: data.rating || 0,
      })
      .returning();
    return medication;
  }

  async findAll(query: QueryMedicationDto) {
    const conditions = [];

    if (query.search) {
      conditions.push(like(medicationTable.name, `%${query.search}%`));
    }

    if (query.stockStatus) {
      conditions.push(eq(medicationTable.stockStatus, query.stockStatus));
    }

    if (query.category) {
      conditions.push(eq(medicationTable.category, query.category));
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const offset = (page - 1) * limit;

    const items = await this.DbProvider.select()
      .from(medicationTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(medicationTable.createdAt);

    const [{ count }] = await this.DbProvider.select({
      count: sql<number>`count(*)::int`,
    })
      .from(medicationTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      items,
      total: count,
      page: query.page,
      limit: limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: string) {
    const [medication] = await this.DbProvider.select()
      .from(medicationTable)
      .where(eq(medicationTable.id, id))
      .limit(1);
    return medication;
  }

  async findByIds(ids: string[]) {
    if (!ids || ids.length === 0) {
      return [];
    }

    const medications = await this.DbProvider.select()
      .from(medicationTable)
      .where(
        and(
          inArray(medicationTable.id, ids),
          // eq(medicationTable.stockStatus, 'in_stock'),
        ),
      );

    return medications;
  }

  async update(id: string, data: UpdateMedicationDto) {
    const updateData: any = { ...data, updatedAt: new Date() };

    if (data.price !== undefined) {
      updateData.price = data.price.toString();
    }

    if (data.rating !== undefined) {
      updateData.rating = data.rating.toString();
    }

    const [medication] = await this.DbProvider.update(medicationTable)
      .set(updateData)
      .where(eq(medicationTable.id, id))
      .returning();
    return medication;
  }

  async delete(id: string) {
    const [medication] = await this.DbProvider.delete(medicationTable)
      .where(eq(medicationTable.id, id))
      .returning();
    return medication;
  }
}
