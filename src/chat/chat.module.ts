import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ConversationRepository } from '@src/chat/repository/conversation.repository';
import { MessageRepository } from '@src/chat/repository/message.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule], 
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ConversationRepository,
    MessageRepository,
  ],
  exports: [ChatService],
})
export class ChatModule {}
