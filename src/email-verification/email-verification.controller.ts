import { Controller, UseGuards, Req, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';
import { EmailVerificationService } from '@src/email-verification/email-verification.service';
import { ApiHeader, ApiCookieAuth, ApiBearerAuth } from '@nestjs/swagger';
import { VerifyOTPDto } from '@src/email-verification/dto/verify-otp.dto';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant', 'patient')
  @Post('send-otp')
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  async sendOTPToEmail(@Req() req: Request) {
    const { email } = req.user;
    console.log('email', email)
    const sendOTPToEmail =
      await this.emailVerificationService.sendOTPToEmail(email);

    return { success: true, message: sendOTPToEmail };
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant', 'patient')
  @Post('verify-otp')
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  async verifyOTP(@Req() req: Request, @Body() body: VerifyOTPDto) {
    const { email } = req.user;

    const result =
      await this.emailVerificationService.verifyOTP(body, email);

    return { success: true, message: result };
  }
}
