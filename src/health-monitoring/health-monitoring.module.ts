import { Module } from '@nestjs/common';
import { HealthMonitoringService } from './health-monitoring.service';
import { HealthMonitoringController } from './health-monitoring.controller';

@Module({
  controllers: [HealthMonitoringController],
  providers: [HealthMonitoringService],
})
export class HealthMonitoringModule {}
