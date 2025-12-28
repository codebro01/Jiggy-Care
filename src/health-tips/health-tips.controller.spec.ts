import { Test, TestingModule } from '@nestjs/testing';
import { HealthTipsController } from './health-tips.controller';
import { HealthTipsService } from './health-tips.service';

describe('HealthTipsController', () => {
  let controller: HealthTipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthTipsController],
      providers: [HealthTipsService],
    }).compile();

    controller = module.get<HealthTipsController>(HealthTipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
