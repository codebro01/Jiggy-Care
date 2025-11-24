import { Module } from '@nestjs/common';
import { BookingController } from '@src/booking/booking.controller';
import { BookingService } from '@src/booking/booking.service';
import { BookingRepository } from '@src/booking/repository/booking.repository';
import { ConsultantModule } from '@src/consultant/consultant.module';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule, ConsultantModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository]
})
export class BookingModule {}
