import { Injectable, Inject } from '@nestjs/common';
import { cartTable, cartTableInsertType } from '@src/db/cart';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class CartRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async create(data: Omit<cartTableInsertType, 'patientId'>, patientId: string) {
    const [cart] = await this.DbProvider.insert(cartTable)
      .values({ ...data, patientId })
      .returning();
    return cart;
  }

  async findAll(patientId: string) {
    const cart = await this.DbProvider.select()
      .from(cartTable)
      .where(eq(cartTable.patientId, patientId));

    return cart;
  }

  async findOne(patientId: string) {
    const [cart] = await this.DbProvider.select()
      .from(cartTable)
      .where(eq(cartTable.patientId, patientId));

    return cart;
  }

  async update(data: Partial<cartTableInsertType>, patientId: string) {
    const [cart] = await this.DbProvider.update(cartTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cartTable.patientId, patientId))
      .returning();
    return cart;
  }
}
