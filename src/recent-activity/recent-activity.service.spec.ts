import { Test, TestingModule } from '@nestjs/testing';
import { RecentActivityService } from './recent-activity.service';

describe('RecentActivityService', () => {
  let service: RecentActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecentActivityService],
    }).compile();

    service = module.get<RecentActivityService>(RecentActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
