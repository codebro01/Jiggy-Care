import { Controller, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';
import { EmailVerificationService } from '@src/email-verification/email-verification.service';
// import { ApiHeader, ApiCookieAuth, ApiBearerAuth } from '@nestjs/swagger';

@Controller('email-verification')
export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationService){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('consultant', 'patient')
    async sendOTPToEmail(@Req() req: Request) {
            const {email} = req.user;

            const sendOTPToEmail = await this.emailVerificationService.sendOTPToEmail(email);

            return {success: true, message: sendOTPToEmail}
    }
}
