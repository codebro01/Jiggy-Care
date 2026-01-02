// support.controller.ts
import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import type { Request } from '@src/types';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'patient', 'consultant', 'agent')
  @Post()
  @ApiOperation({
    summary: 'This endpoint  is used to start a support conversation',
    description: 'This endpoints starts a support conversation',
  })
  @ApiBearerAuth('JWT-auth')
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
  @Post('start')
  async startChat(@Req() req: Request) {

    const patientId = req.user.id;
    const supportChat = await this.supportService.startConversation(patientId);

    return {success: true, data:supportChat}
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'patient', 'consultant', 'agent')
  @ApiOperation({
    summary: 'This endpoint  is used to load a support conversation',
    description: 'This endpoints retrives a support conversation between a patient and an agent',
  })
  @ApiBearerAuth('JWT-auth')
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
  @Get(':conversationId/messages')
  async getMessages(@Param('conversationId') conversationId: string) {
    const supportChat = await this.supportService.getMessages(conversationId);
        return { success: true, data: supportChat };

  }
}
