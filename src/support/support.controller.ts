// support.controller.ts
import { Controller, Post, Get, Param, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import type { Request } from '@src/types';

@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('start')
  async startChat(@Req() req: Request) {
    const patientId = req.user.id;
    return this.supportService.startConversation(patientId);
  }

  @Get(':conversationId/messages')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.supportService.getMessages(conversationId);
  }
}
