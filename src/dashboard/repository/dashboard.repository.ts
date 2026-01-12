import { Injectable, Inject } from '@nestjs/common';
import {
  bookingTable,
  consultantTable,
  patientTable,
  ratingTable,
} from '@src/db';
import { orderTable } from '@src/db/order';
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
              eq(bookingTable.paymentStatus, true)
            ),
          ),
        await this.DbProvider.select({
          total: avg(ratingTable.rating),
        })
          .from(ratingTable)
          .where(eq(ratingTable.consultantId, consultantId)),
      ]);

    return {
      noOfCompletedBookings,
      noOfUpcomingBookings,
      averageRating,
    };
  }

  // !admin dashboard

  async adminDashboard() {
    const [
      [totalPatients],
      [totalConsultants],
      [totalPendingOrders],
      [totalAppointments],
    ] = await Promise.all([
      this.DbProvider.select({
        total: count(),
      }).from(patientTable),

      this.DbProvider.select({
        total: count(),
      })
        .from(consultantTable)
        .where(eq(consultantTable.approvedStatus, true)),

      this.DbProvider.select({
        total: count(),
      })
        .from(orderTable)
        .where(
          and(
            eq(orderTable.status, 'pending'),
            eq(orderTable.paymentStatus, 'paid'),
          ),
        ),
      this.DbProvider.select({
        total: count(),
      })
        .from(bookingTable)
        .where(
          and(
            eq(bookingTable.paymentStatus, true),
            eq(bookingTable.status, 'completed'),
          ),
        ),
    ]);

    return {
      totalAppointments,
      totalConsultants,
      totalPatients,
      totalPendingOrders,
    };
  }

}
