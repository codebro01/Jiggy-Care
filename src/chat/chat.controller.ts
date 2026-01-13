import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '@src/chat/chat.service';
import { CreateConversationDto } from '@src/chat/dto/create-conversation.dto';
import { CreateMessageDto } from '@src/chat/dto/create-messages.dto';
import { ApiBearerAuth, ApiHeader, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant')
  @Get('conversations')
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
  async getConversations(
    @Query('consultantId') consultantId?: string,
    @Query('patientId') patientId?: string,
  ) {
    return await this.chatService.getConversations({
      consultantId,
      patientId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant')
  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
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
  async createConversation(@Body() body: CreateConversationDto) {
    return await this.chatService.getOrCreateConversation(
      body.bookingId,
      body.consultantId,
      body.patientId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant')
  @Get('conversations/:conversationId/messages')
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
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.chatService.getMessages(
      conversationId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant')
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
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
  async sendMessage(
    @Body()
    body: CreateMessageDto,
  ) {
    return await this.chatService.sendMessage(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant')
  @Get('conversations/:conversationId/unread')
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
  async getUnreadCount(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId: string,
  ) {
    const count = await this.chatService.getUnreadCount(conversationId, userId);
    return { conversationId, unreadCount: count };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant')
  @Post('conversations/:conversationId/read')
  @HttpCode(HttpStatus.OK)
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
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Body() body: { messageIds: string[] },
  ) {
    return await this.chatService.markMessagesAsRead(
      conversationId,
      body.messageIds,
    );
  }
}
