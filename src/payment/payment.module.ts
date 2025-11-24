import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { DbProvider } from '@src/db/provider';
import {  HttpModule } from '@nestjs/axios';
import { UserModule } from '@src/users/users.module';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import { BookingModule } from '@src/booking/booking.module';
import { NotificationModule } from '@src/notification/notification.module';

@Module({
  imports: [HttpModule,BookingModule, UserModule, NotificationModule],
  controllers: [PaymentController],
  providers: [PaymentService, DbProvider, PaymentRepository],
})
export class PaymentModule {}

