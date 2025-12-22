import { Module } from '@nestjs/common';
import { DbModule } from '@src/db/db.module';
import { EmailVerificationRepository } from '@src/email-verification/repository/email-verification.repository';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { EmailModule } from '@src/email/email.module';
import { UserModule } from '@src/users/users.module';
@Module({
  imports: [DbModule, EmailModule, UserModule],
  providers: [EmailVerificationRepository, EmailVerificationService],
  exports: [EmailVerificationRepository],
  controllers: [EmailVerificationController],
})
export class EmailVerificationModule {}
