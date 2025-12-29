import { Module } from '@nestjs/common';
import { RecentActivityService } from './recent-activity.service';
import { RecentActivityController } from './recent-activity.controller';
import { DbModule } from '@src/db/db.module';
import { RecentActivityRepository } from '@src/recent-activity/repository/recent-activity.repository';


@Module({
  imports: [DbModule], 
  controllers: [RecentActivityController],
  providers: [RecentActivityService, RecentActivityRepository],
})
export class RecentActivityModule {}
