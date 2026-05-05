import { forwardRef, Module } from '@nestjs/common';
import { BookingController } from '@src/booking/booking.controller';
import { BookingService } from '@src/booking/booking.service';
import { BookingRepository } from '@src/booking/repository/booking.repository';
import { ConsultantModule } from '@src/consultant/consultant.module';
import { OneSignalModule } from '@src/one-signal/one-signal.module';
import { DbModule } from '@src/db/db.module';
import { EmailModule } from '@src/email/email.module';
import { UserModule } from '@src/users/users.module';

@Module({
  imports: [
    DbModule,
    ConsultantModule,
    OneSignalModule,
    EmailModule,
    forwardRef(() => UserModule),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
