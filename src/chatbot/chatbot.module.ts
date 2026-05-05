import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotRepository } from './repository/chatbot.repository';

@Module({

  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotRepository],
})
export class ChatbotModule {}
