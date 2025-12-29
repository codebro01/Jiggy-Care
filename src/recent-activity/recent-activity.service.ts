import { Injectable } from '@nestjs/common';
import { CreateRecentActivityDto } from './dto/create-recent-activity.dto';
import { RecentActivityRepository } from '@src/recent-activity/repository/recent-activity.repository';

@Injectable()
export class RecentActivityService {
  constructor(
    private readonly recentActivityRepository: RecentActivityRepository,
  ) {}
  async createRecentActivity(data: CreateRecentActivityDto, userId: string) {
    const recentActivity =
      await this.recentActivityRepository.createRecentActivity(data, userId);
    return recentActivity;
  }

  async getRecentActivity(userId: string) {
    const recentActivity =
      await this.recentActivityRepository.getRecentActivity(userId);

      return recentActivity;
  }
}
