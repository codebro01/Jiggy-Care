import { Module } from '@nestjs/common';
import { HealthTipsService } from './health-tips.service';
import { HealthTipsController } from './health-tips.controller';
import { DbModule } from '@src/db/db.module';
import { HealthTipsRepository } from '@src/health-tips/repository/health-tips.repository';

@Module({
  imports: [DbModule], 
  controllers: [HealthTipsController],
  providers: [HealthTipsService, HealthTipsRepository],
})
export class HealthTipsModule {}
