import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus, Req} from '@nestjs/common';
import { RecentActivityService } from './recent-activity.service';
import { CreateRecentActivityDto } from './dto/create-recent-activity.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import type { Request } from '@src/types';

@Controller('recent-activity')
export class RecentActivityController {
  constructor(private readonly recentActivityService: RecentActivityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({
    summary: 'Creates Recent Activity',
    description:
      'This  endpoint is used to create recent activity. Accessible by admin',
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
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async create(@Body() data: CreateRecentActivityDto, @Req() req: Request) {
    const { id: userId } = req.user;

    const recentActivity = await this.recentActivityService.createRecentActivity(data, userId);

    return {success: true, data:recentActivity}
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get()
  @ApiOperation({
    summary: 'Get all recent activity',
    description:
      'Get all recent activities. Accessible by patients',
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async findAll(@Req() req: Request) {
    const { id: userId } = req.user;
    const recentActivity = await this.recentActivityService.getRecentActivity(userId);

    return {success: true, data: recentActivity}
  }
}
