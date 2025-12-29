import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { recentActivityTable, recentActivityTableInsertType } from '@src/db';

@Injectable()
export class RecentActivityRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createRecentActivity(
    data: Omit<recentActivityTableInsertType, 'userId'>,
    userId: string
  ) {
    const [recentActivity] = await this.DbProvider.insert(recentActivityTable)
      .values({ ...data, userId })
      .returning();

    return recentActivity;
  }

  async getRecentActivity(userId: string) {
    const recentActivity = await this.DbProvider.select()
      .from(recentActivityTable).where(eq(recentActivityTable.userId, userId)).limit(5)

    return recentActivity;
  }
}
