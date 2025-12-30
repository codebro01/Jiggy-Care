import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmailVerificationRepository } from '@src/email-verification/repository/email-verification.repository';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
import { UserRepository } from '@src/users/repository/user.repository';
import { VerifyOTPDto } from '@src/email-verification/dto/verify-otp.dto';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
  ) {}

  async sendOTPToEmail(email: string, fullName: string) {
    const user = await this.userRepository.findUserByEmail(email);

    if (user)
      throw new BadRequestException(
        'This email has already been used, please use another email',
      );

    const emailVerificationRecord =
      await this.emailVerificationRepository.findUserByEmail({ email });

    if (emailVerificationRecord && emailVerificationRecord.used === true)
      throw new BadRequestException('This email has already been verified');

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

    console.log(generateRandomSixDigitCode);

    await this.emailService.queueTemplatedEmail(
      EmailTemplateType.EMAIL_VERIFICATION,
      email,
      {
        verificationCode: generateRandomSixDigitCode,
        name: fullName,
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

  async verifyOTP(data: VerifyOTPDto, email: string) {
    // ! -------------- verify code before saveing data into the db---------------
    if (!data.OTP)
      throw new Error(
        'Code sent to your email must  be provided in order to proceed',
      );

    const user = await this.emailVerificationRepository.findUserByEmail({
      email,
    });

    if (!user) throw new NotFoundException(`Invalid OTP, please try again`);

    if (!user.emailVerificationCode)
      throw new Error('Verification error: Please try again');

    if (user.used) {
      throw new BadRequestException('This code has already been used');
    }

    if (user.attempts === 10) {
      const { hashRandomSixDigitCode } = await this.sixDigitCodeGenerator();

      await this.emailVerificationRepository.updateEmailVerification(
        { emailVerificationCode: hashRandomSixDigitCode },
        email,
      );
      throw new BadRequestException(
        'Attempts reached, if more failed attempts comes up, account will be suspended!!!',
      );
    }

    if (new Date() > user.expiresAt) {
      throw new BadRequestException(
        'Code has expired, please request a new one',
      );
    }

    const verifyHashedCode = await bcrypt.compare(
      String(data.OTP),
      user.emailVerificationCode,
    );
    await this.emailVerificationRepository.updateEmailVerification(
      { attempts: user.attempts + 1 },
      email,
    );

    console.log(data.OTP, user);

    if (!verifyHashedCode)
      throw new BadRequestException('Invalid OTP, please try again');

    await this.emailVerificationRepository.updateEmailVerification(
      { used: true },
      email,
    );

    // ! here i will upudate user info and set email verified to true

    // const updatedUser = await this.userRepository.updateUserByEmail(
    //   { emailVerified: true },
    //   user.email,
    // );

    // console.log('updatedUser', updatedUser);
    // console.log('user', user);

    // let payload;
    // if (updatedUser.role === 'patient')
    //   payload = await this.userRepository.findPatientById(updatedUser.id);
    // if (updatedUser.role === 'consultant')
    //   payload = await this.userRepository.findApprovedConsultantById(
    //     updatedUser.id,
    //   );
    // return payload;

    return true;
  }
}
