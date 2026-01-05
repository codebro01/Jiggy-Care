import { Controller, Req, Get } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import type { Request } from '@src/types';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiHeader, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';


@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService){}

 @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('consultant')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
    async consultantDashboard(@Req() req: Request) {
        const {id: consultantId} = req.user;

        const consultantDashboard = await this.dashboardService.consultantDashboard(consultantId);

        return {success: true, data: consultantDashboard}
    }
}
