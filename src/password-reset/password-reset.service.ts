import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
import { UserRepository } from '@src/users/repository/user.repository';
import { PasswordResetRepository } from '@src/password-reset/repository/password-reset.repository';
import { PasswordResetDto } from '@src/password-reset/dto/password-reset.dto';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
  ) {}

  async sendOTPToEmail(email: string) {
    const isUserExist = await this.userRepository.findUserByEmail(email);

    if (!isUserExist)
      throw new BadRequestException(
        'A one time password has been sent to your registered email',
      );

    const passwordResetRecord =
      await this.passwordResetRepository.findUserByEmail({ email });

    const { generateRandomSixDigitCode, hashRandomSixDigitCode } =
      await this.sixDigitCodeGenerator();

    if (passwordResetRecord) {
      await this.passwordResetRepository.updatePasswordReset(
        {
          passwordResetCode: hashRandomSixDigitCode,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
        email,
      );
    } else {
      await this.passwordResetRepository.createPasswordResetData({
        email: email,
        passwordResetCode: hashRandomSixDigitCode,
        used: false,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
    }

    await this.emailService.queueTemplatedEmail(
      EmailTemplateType.PASSWORD_RESET,
      email,
      {
        resetCode: generateRandomSixDigitCode,
        name: isUserExist.fullName,
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

  async verifyOTP(data: PasswordResetDto) {
    const {email} = data;
    // ! -------------- verify code before saveing data into the db---------------
    if (!data.OTP)
      throw new Error(
        'Code sent to your email must  be provided in order to proceed',
      );

    const user = await this.passwordResetRepository.findUserByEmail({
      email,
    });

    if (!user) throw new NotFoundException(`Invalid OTP, please try again`);

    if (!user.passwordResetCode)
      throw new Error('Verification error: Please try again');

    if (user.used) {
      throw new BadRequestException('This code has already been used');
    }

    if (user.attempts === 3) {
      const { hashRandomSixDigitCode } = await this.sixDigitCodeGenerator();

      await this.passwordResetRepository.updatePasswordReset(
        { passwordResetCode: hashRandomSixDigitCode },
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
      user.passwordResetCode,
    );
    await this.passwordResetRepository.updatePasswordReset(
      { attempts: user.attempts + 1 },
      email,
    );

    if (!verifyHashedCode)
      throw new BadRequestException('Invalid OTP, please try again');

    await this.passwordResetRepository.updatePasswordReset(
      { used: true },
      email,
    );

    // ! here i will upudate user info and set email verified to true
    const hashPassword = await bcrypt.hash(data.password, 10);
    const updatedUser = await this.userRepository.updateUserPasswordByEmail(
      { password: hashPassword },
      user.email,
    );

    console.log('updatedUser', updatedUser);
    console.log('user', user);

    let payload;
    if (updatedUser.role === 'patient')
      payload = await this.userRepository.findPatientById(updatedUser.id);
    if (updatedUser.role === 'consultant')
      payload = await this.userRepository.findApprovedConsultantById(
        updatedUser.id,
      );
    return payload;
  }
}
