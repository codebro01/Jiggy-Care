import { Controller, Req, Get } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import type { Request } from '@src/types';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiHeader, ApiBearerAuth, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';


@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Get('consultant')
  @ApiOperation({
    summary: 'This endpoint fetches consultant dashboard cards data',
    description:
      'This endpoint is fetches admin  consultant data. It is only accessible to admins',
  })
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
    const { id: consultantId } = req.user;

    const consultantDashboard =
      await this.dashboardService.consultantDashboard(consultantId);

    return { success: true, data: consultantDashboard };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  @ApiOperation({
    summary: 'This endpoint fetches admin dashboard cards data',
    description:
      'This endpoint is fetches admin  dashboard data. It is only accessible to admins',
  })
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
  async adminDashboard() {
    const adminDashboard = await this.dashboardService.adminDashboards();

    return { success: true, data: adminDashboard };
  }
}
