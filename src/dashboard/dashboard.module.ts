import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from '@src/dashboard/repository/dashboard.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports:[DbModule], 
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
  exports: [DashboardService, DashboardRepository]
})
export class DashboardModule {}
