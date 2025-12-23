


import { Controller, Post, Body } from '@nestjs/common';
import { ApiHeader, ApiCookieAuth, ApiBearerAuth } from '@nestjs/swagger';
import { SendOTPDto } from '@src/password-reset/dto/send-otp.dto';
import { PasswordResetService } from '@src/password-reset/password-reset.service';
import { PasswordResetDto } from '@src/password-reset/dto/password-reset.dto';

@Controller('password-reset')
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
  ) {}

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
  async sendOTPToEmail(@Body() body: SendOTPDto) {
    const sendOTPToEmail =
      await this.passwordResetService.sendOTPToEmail(body.email);

    return { success: true, message: sendOTPToEmail };
  }


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
  async verifyOTP( @Body() body: PasswordResetDto) {

    const result =
      await this.passwordResetService.verifyOTP(body);

    return { success: true, message: result };
  }
}
