import { Module } from '@nestjs/common';
import { HealthMonitoringService } from './health-monitoring.service';
import { HealthMonitoringController } from './health-monitoring.controller';
import { HealthMonitoringRepository } from '@src/health-monitoring/repository/health-monitoring.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports:[DbModule], 
  controllers: [HealthMonitoringController],
  providers: [HealthMonitoringService, HealthMonitoringRepository],
  exports: [HealthMonitoringService, HealthMonitoringRepository],
})
export class HealthMonitoringModule {}
