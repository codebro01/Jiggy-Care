import { Test, TestingModule } from '@nestjs/testing';
import { HealthTipsService } from './health-tips.service';

describe('HealthTipsService', () => {
  let service: HealthTipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthTipsService],
    }).compile();

    service = module.get<HealthTipsService>(HealthTipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
