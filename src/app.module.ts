import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from '@src/neon/neon.module';
import { NeonProvider } from '@src/neon/neon.provider';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterService } from './multer/multer.service';
import { MulterModule } from './multer/multer.module';
import { UploadController } from './upload/upload.controller';
import { UploadModule } from './upload/upload.module';
import { ConsultantModule } from './consultant/consultant.module';
import { HelpersModule } from './helpers/helpers.module';
import { PatientModule } from './patient/patient.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationModule } from './notification/notification.module';
import { RatingModule } from './rating/rating.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { MedicationModule } from './medication/medication.module';
import { OrderModule } from './order/order.module';
import { LabModule } from './lab/lab.module';
import { TestModule } from './test/test.module';
import { TestBookingModule } from './test-booking/test-booking.module';
import { HealthMonitoringModule } from './health-monitoring/health-monitoring.module';
import { TestResultModule } from './test-result/test-result.module';
import { ChatModule } from './chat/chat.module';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { TestBookingPaymentModule } from './test-booking-payment/test-booking-payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available everywhere
    }),
    UserModule,
    AuthModule,
    SupabaseModule,
    JwtModule,
    CloudinaryModule,
    MulterModule,
    UploadModule,
    ConsultantModule,
    HelpersModule,
    PatientModule,
    BookingModule,
    PaymentModule,
    NotificationModule,
    RatingModule,
    PrescriptionModule,
    MedicationModule,
    OrderModule,
    LabModule,
    TestModule,
    TestBookingModule,
    HealthMonitoringModule,
    TestResultModule,
    ChatModule,
    GoogleAuthModule,
    TestBookingPaymentModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, NeonProvider, MulterService],
})
export class AppModule {}
