import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserRepository } from '@src/users/repository/user.repository';
import { DbModule } from '@src/db/db.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NeonProvider } from '@src/neon/neon.provider';
import { AuthModule } from '@src/auth/auth.module';
import { jwtConstants } from '@src/auth/jwtContants';
import { HelpersModule } from '@src/helpers/helpers.module';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { EmailVerificationModule } from '@src/email-verification/email-verification.module';
import { BookingModule } from '@src/booking/booking.module';
import { PrescriptionModule } from '@src/prescription/prescription.module';
import { TestResultModule } from '@src/test-result/test-result.module';

@Module({
  imports: [
    DbModule,
    forwardRef(() => AuthModule),
    HelpersModule,
    EmailVerificationModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.accessTokenSecret,
    }),
    TestResultModule,
    PrescriptionModule,
    BookingModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    JwtService,
    NeonProvider,
    JwtAuthGuard,
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
