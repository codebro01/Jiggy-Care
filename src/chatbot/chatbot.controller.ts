import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard'; // adjust to your guard path
import { SendMessageDto } from './dto/send-message-dto';
import type { Request } from '@src/types';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('send')
  @ApiOperation({
    summary: 'This endpoint enables patient send message to the chatbot',
    description:
      'This endpoint enables patient send message to the chatbot and it is only accessible to patients',
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @Post('message')
  async sendMessage(@Req() req: Request, @Body() dto: SendMessageDto) {
    const { id: patientId } = req.user;
    return this.chatbotService.sendMessage(patientId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('session')
  @ApiOperation({
    summary: 'This endpoint helps to get  sessions',
    description:
      'This endpoint helps to get  sessions and it is only accessible to patients',
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @Get('session/:sessionId')
  async getSessionHistory(@Param('sessionId') sessionId: string) {
    return this.chatbotService.getSessionHistory(sessionId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('patient/session')
  @ApiOperation({
    summary: 'This endpoint helps to get patient sessions',
    description:
      'This endpoint helps to get patient sessions and it is only accessible to patients',
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @Get('sessions')
  async getPatientSessions(@Req() req: Request) {
    const { id: patientId } = req.user;

    return this.chatbotService.getPatientSessions(patientId);
  }
}
