import { Test, TestingModule } from '@nestjs/testing';
import { TestBookingService } from './test-booking.service';

describe('TestBookingService', () => {
  let service: TestBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestBookingService],
    }).compile();

    service = module.get<TestBookingService>(TestBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
