import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConversationRepository } from '@src/chat/repository/conversation.repository';
import { MessageRepository } from '@src/chat/repository/message.repository';

export interface SendMessageDto {
  consultantId?: string;
  patientId?: string;
  content: string;
  senderType: 'consultant' | 'patient';
}

export interface GetConversationDto {
  consultantId?: string;
  patientId?: string;
}

@Injectable()
export class ChatService {
  constructor(
    private conversationRepo: ConversationRepository,
    private messageRepo: MessageRepository,
  ) {}

  async getOrCreateConversation(consultantId: string, patientId: string) {
    let conversation = await this.conversationRepo.findByParticipants(
      consultantId,
      patientId,
    );

    if (!conversation) {
      conversation = await this.conversationRepo.create(
        consultantId,
        patientId,
      );
    }

    return conversation;
  }

  async sendMessage(dto: SendMessageDto) {
    const { consultantId, patientId, content, senderType } = dto;

    if (!consultantId || !patientId) {
      throw new BadRequestException(
        'Both consultantId and patientId are required',
      );
    }

    const conversation = await this.getOrCreateConversation(
      consultantId,
      patientId,
    );

    const senderId = senderType === 'consultant' ? consultantId : patientId;

    const message = await this.messageRepo.create({
      conversationId: conversation.id,
      senderId,
      senderType,
      content,
    });

    return {
      message,
      conversation,
    };
  }

  async getConversations(dto: GetConversationDto) {
    const { consultantId, patientId } = dto;

    if (consultantId) {
      return await this.conversationRepo.findByConsultant(consultantId);
    }

    if (patientId) {
      return await this.conversationRepo.findByPatient(patientId);
    }

    throw new BadRequestException(
      'Either consultantId or patientId is required',
    );
  }

  async getMessages(conversationId: string, limit = 50, offset = 0) {
    const conversation = await this.conversationRepo.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepo.findByConversation(
      conversationId,
      limit,
      offset,
    );

    return {
      conversation,
      messages: messages.reverse(), 
    };
  }

  async markMessagesAsRead(conversationId: string, messageIds: string[]) {
    return await this.messageRepo.markAsRead(messageIds);
  }

  async getUnreadCount(conversationId: string, userId: string) {
    return await this.messageRepo.countUnread(conversationId, userId);
  }
}
