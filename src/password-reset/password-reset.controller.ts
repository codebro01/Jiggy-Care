


import { Controller, UseGuards, Req, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';
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
  async verifyOTP(@Req() req: Request, @Body() body: PasswordResetDto) {
    const { email } = req.user;

    const result =
      await this.passwordResetService.verifyOTP(body, email);

    return { success: true, message: result };
  }
}
