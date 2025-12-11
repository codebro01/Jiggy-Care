import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { DbProvider } from '@src/db/provider';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '@src/users/users.module';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import { BookingModule } from '@src/booking/booking.module';
import { NotificationModule } from '@src/notification/notification.module';
import { OrderModule } from '@src/order/order.module';
import { MedicationModule } from '@src/medication/medication.module';
import { LabModule } from '@src/lab/lab.module';
import { TestBookingModule } from '@src/test-booking/test-booking.module';
import { TestModule } from '@src/test/test.module';

@Module({
  imports: [
    HttpModule,
    BookingModule,
    UserModule,
    NotificationModule,
    OrderModule,
    MedicationModule,
    LabModule,
    TestBookingModule,
    TestModule, 
  ],
  controllers: [PaymentController],
  providers: [PaymentService, DbProvider, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
