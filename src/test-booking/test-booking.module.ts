import { Module } from '@nestjs/common';
import { TestBookingService } from './test-booking.service';
import { TestBookingController } from './test-booking.controller';
import { TestBookingRepository } from '@src/test-booking/repository/test-booking.repository';
import { DbModule } from '@src/db/db.module';
@Module({
  imports: [DbModule], 
  controllers: [TestBookingController],
  providers: [TestBookingService, TestBookingRepository],
  exports: [TestBookingService, TestBookingRepository],
})
export class TestBookingModule {}
