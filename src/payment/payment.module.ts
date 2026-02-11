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
import { TestBookingPaymentModule } from '@src/test-booking-payment/test-booking-payment.module';
import { CartModule } from '@src/cart/cart.module';
import { OneSignalModule } from '@src/one-signal/one-signal.module';
import { EmailModule } from '@src/email/email.module';
import { SpecialityModule } from '@src/speciality/speciality.module';
import { ConsultantModule } from '@src/consultant/consultant.module';

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
    TestBookingPaymentModule, 
    CartModule, 
    OneSignalModule, 
    EmailModule, 
    SpecialityModule,
    ConsultantModule 
  ],
  controllers: [PaymentController],
  providers: [PaymentService, DbProvider, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
