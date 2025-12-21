import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from './repository/auth.repository';
import { DbModule } from '@src/db/db.module';
import { SupabaseModule } from '@src/neon/neon.module';
import { UserModule } from '@src/users/users.module';
import { HelpersModule } from '@src/helpers/helpers.module';
import { PatientModule } from '@src/patient/patient.module';
import { ConsultantModule } from '@src/consultant/consultant.module';
import { GoogleAuthModule } from '@src/google-auth/google-auth.module';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' }, // token expiry
    }),
    DbModule,
    HelpersModule,
    SupabaseModule,
     PatientModule,
     ConsultantModule,
     GoogleAuthModule, 
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthGuard],
  exports: [AuthRepository, AuthService],
})
export class AuthModule {}
