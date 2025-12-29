import { Inject, Injectable } from '@nestjs/common';
import { healthTipsTable } from '@src/db';
import { CreateHealthTipDto } from '@src/health-tips/dto/create-health-tip.dto';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class HealthTipsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async createHealthTip(data: CreateHealthTipDto, userId: string) {
    const [healthTip] = await this.DbProvider.insert(healthTipsTable)
      .values({...data, userId})
      .returning();
    return healthTip;
  }

  async updateHealthTip(data: Partial<CreateHealthTipDto>, id: string) {
    const [healthTips] = await this.DbProvider.update(healthTipsTable)
      .set(data)
      .where(eq(healthTipsTable.id, id))
      .returning();
    return healthTips;
  }

  async getHealthTips() {
    const healthTips = await this.DbProvider.select().from(healthTipsTable);

    return healthTips;
  }
}
