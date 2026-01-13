import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConversationRepository } from '@src/chat/repository/conversation.repository';
import { MessageRepository } from '@src/chat/repository/message.repository';

export interface SendMessageDto {
  conversationId?:string, 
  consultantId?: string;
  patientId?: string;
  bookingId:string;
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

  async getOrCreateConversation(
    bookingId: string,
    consultantId: string,
    patientId: string,
  ) {
    let conversation = await this.conversationRepo.findByParticipants(
      bookingId,
      consultantId,
      patientId,
    );

    if (!conversation) {
      conversation = await this.conversationRepo.create(
        bookingId,
        consultantId,
        patientId,
      );
    }

    return conversation;
  }

  getConversationByConversationId(conversationId: string) {
    return this.conversationRepo.findById(conversationId);
  }

  async sendMessage(dto: SendMessageDto) {
    const { bookingId, consultantId, patientId, content, senderType } = dto;

    if (!consultantId || !patientId || !bookingId) {
      throw new BadRequestException(
        'bookingId, consultantId and patientId are required',
      );
    }

    const conversation = await this.getOrCreateConversation(
      bookingId,
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
    // Validate conversation exists
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Pass conversationId to repository for validation
    return await this.messageRepo.markAsRead(conversationId, messageIds);
  }

  async getUnreadCount(conversationId: string, userId: string) {
    return await this.messageRepo.countUnread(conversationId, userId);
  }
}
