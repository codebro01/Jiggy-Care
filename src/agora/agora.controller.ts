// calls/calls.controller.ts
import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgoraService } from './agora.service';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import type { Request } from '@src/types';

@Controller('agora')
export class AgoraController {
  constructor(private agoraService: AgoraService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant')
  @Get('token')
  @ApiOperation({ summary: 'Generate Agora RTC token for a given channel name' })
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
  getToken(@Query('channelName') channelName: string, @Req() req: Request) {
    const {id: userId} = req.user;
    // Using 0 means Agora auto-assigns a uid
    // You can also derive one from user.id if you want to track who's who
    const uid = this.agoraService.uidFromUserId(userId);
    return this.agoraService.generateToken(channelName, uid);
  }
}
