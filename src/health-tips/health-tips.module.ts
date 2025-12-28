import { Module } from '@nestjs/common';
import { HealthTipsService } from './health-tips.service';
import { HealthTipsController } from './health-tips.controller';

@Module({
  controllers: [HealthTipsController],
  providers: [HealthTipsService],
})
export class HealthTipsModule {}
