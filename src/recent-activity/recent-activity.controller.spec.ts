import { Test, TestingModule } from '@nestjs/testing';
import { RecentActivityController } from './recent-activity.controller';
import { RecentActivityService } from './recent-activity.service';

describe('RecentActivityController', () => {
  let controller: RecentActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecentActivityController],
      providers: [RecentActivityService],
    }).compile();

    controller = module.get<RecentActivityController>(RecentActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
