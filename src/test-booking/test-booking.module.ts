import { Module } from '@nestjs/common';
import { TestBookingService } from './test-booking.service';
import { TestBookingController } from './test-booking.controller';

@Module({
  controllers: [TestBookingController],
  providers: [TestBookingService],
})
export class TestBookingModule {}
