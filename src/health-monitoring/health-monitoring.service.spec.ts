import { Test, TestingModule } from '@nestjs/testing';
import { HealthMonitoringService } from './health-monitoring.service';

describe('HealthMonitoringService', () => {
  let service: HealthMonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthMonitoringService],
    }).compile();

    service = module.get<HealthMonitoringService>(HealthMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
