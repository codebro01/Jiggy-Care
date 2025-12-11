import { Test, TestingModule } from '@nestjs/testing';
import { HealthMonitoringController } from './health-monitoring.controller';
import { HealthMonitoringService } from './health-monitoring.service';

describe('HealthMonitoringController', () => {
  let controller: HealthMonitoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthMonitoringController],
      providers: [HealthMonitoringService],
    }).compile();

    controller = module.get<HealthMonitoringController>(HealthMonitoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
