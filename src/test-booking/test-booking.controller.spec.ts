import { Test, TestingModule } from '@nestjs/testing';
import { TestBookingController } from './test-booking.controller';
import { TestBookingService } from './test-booking.service';

describe('TestBookingController', () => {
  let controller: TestBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestBookingController],
      providers: [TestBookingService],
    }).compile();

    controller = module.get<TestBookingController>(TestBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
