import { Injectable, Inject } from '@nestjs/common';
import { bookingTable, ratingTable } from '@src/db';
import { and, avg, count, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class DashboardRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async consultantDashboard(consultantId: string) {
    const [[noOfCompletedBookings], [noOfUpcomingBookings], [averageRating]] =
      await Promise.all([
        await this.DbProvider.select({
          total: count(),
        })
          .from(bookingTable)
          .where(
            and(
              eq(bookingTable.consultantId, consultantId),
              eq(bookingTable.status, 'completed'),
            ),
          ),
        await this.DbProvider.select({
          total: count(),
        })
          .from(bookingTable)
          .where(
            and(
              eq(bookingTable.consultantId, consultantId),
              eq(bookingTable.status, 'upcoming'),
            ),
          ),
        await this.DbProvider.select({
          total: avg(ratingTable.rating),
        })
          .from(bookingTable)
          .where(eq(ratingTable.consultantId, consultantId)),
      ]);

      return {
        noOfCompletedBookings, 
        noOfUpcomingBookings, 
        averageRating
      }
  }
}
