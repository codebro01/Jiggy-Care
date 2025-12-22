import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailVerificationRepository } from '@src/email-verification/repository/email-verification.repository';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
import { UserRepository } from '@src/users/repository/user.repository';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository, 
  ) {}

  async sendOTPToEmail(email: string) {

    const isVerified = await this.userRepository.findUserByEmail(email)

    if(isVerified.emailVerified === true) throw new BadRequestException('This email has already been  verified')
    const emailVerificationRecord =
      await this.emailVerificationRepository.findUserByEmail({ email });

    const { generateRandomSixDigitCode, hashRandomSixDigitCode } =
      await this.sixDigitCodeGenerator();

    if (emailVerificationRecord && emailVerificationRecord.used === false) {
      await this.emailVerificationRepository.updateEmailVerification(
        {
          emailVerificationCode: hashRandomSixDigitCode,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
        email,
      );
    } else {
      await this.emailVerificationRepository.createEmailVerificationData({
        email: email,
        emailVerificationCode: hashRandomSixDigitCode,
        used: false,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
    }

    await this.emailService.queueTemplatedEmail(
      EmailTemplateType.EMAIL_VERIFICATION,
      email,
      {
        verificationCode: generateRandomSixDigitCode,
        name: isVerified.fullName,
      },
    );

    return `A one time password has been sent to your registered email`;
  }

  async sixDigitCodeGenerator() {
    crypto.randomUUID().replace(/\D/g, '').slice(0, 6);

    // Or better - directly from random values:
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const generateRandomSixDigitCode = (array[0] % 900000) + 100000;

    const hashRandomSixDigitCode = await bcrypt.hash(
      String(generateRandomSixDigitCode),
      10,
    );

    return { hashRandomSixDigitCode, generateRandomSixDigitCode };
  }
}
