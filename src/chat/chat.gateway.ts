// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// interface JoinRoomDto {
//   conversationId: string;
//   userId: string;
//   userType: 'consultant' | 'patient';
// }

// interface SendMessagePayload {
//   conversationId: string;
//   consultantId: string;
//   patientId: string;
//   content: string;
//   senderType: 'consultant' | 'patient';
// }

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, { userId: string; userType: string }>();

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.activeUsers.delete(client.id);
  }

  @SubscribeMessage('join_conversation')
  handleJoinRoom(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    // Handle both direct data and nested data structure
    const data = payload.data || payload;
    const { conversationId, userId, userType } = data;

    console.log('Received join_conversation payload:', payload);
    console.log('Extracted data:', { conversationId, userId, userType });

    if (!conversationId || !userId || !userType) {
      return {
        event: 'error',
        data: {
          message:
            'Missing required fields: conversationId, userId, or userType',
        },
      };
    }

    client.join(conversationId);
    this.activeUsers.set(client.id, { userId, userType });

    console.log(`User ${userId} joined conversation ${conversationId}`);

    return {
      event: 'joined_conversation',
      data: { conversationId },
    };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveRoom(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.conversationId);
    return {
      event: 'left_conversation',
      data: { conversationId: data.conversationId },
    };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() payload: any,
    // @ConnectedSocket() client: Socket,
  ) {
    // Handle both direct data and nested data structure
    const data = payload.data || payload;
    const { conversationId, content, senderType } = data;

    const conversationInfo =
      await this.chatService.getConversationByConversationId(conversationId);
    if (!conversationInfo)
      throw new NotFoundException('Could not load conversation data');
    console.log('Received send_message payload:', payload);
    console.log('Extracted data:', {
      conversationId,
      content,
      senderType,
    });

    if (!conversationId || !content || !senderType) {
      return {
        event: 'error',
        data: { message: 'Missing required fields' },
      };
    }

    if (!conversationInfo.bookingId) throw new BadRequestException('Could not get booking Id');

    try {
      const result = await this.chatService.sendMessage({
        bookingId: conversationInfo.bookingId, 
        consultantId: conversationInfo?.consultantId,
        patientId: conversationInfo?.patientId,
        content,
        senderType,
      });

      // console.log(
      //   'Sockets in room:',
      //   await this.server.in(conversationId).fetchSockets(),
      // );
      console.log(`Broadcasting to room: ${conversationId}`);
      this.server.to(conversationId).emit('new_message', result);
      console.log('Event emitted successfully');

      return {
        event: 'message_sent',
        data: result,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        event: 'error',
        data: { message: error.message },
      };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody()
    data: { conversationId: string; userId: string; userType: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit('user_typing', {
      userId: data.userId,
      userType: data.userType,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit('user_stopped_typing', {
      userId: data.userId,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { conversationId: string; messageIds: string[] },
  ) {
    await this.chatService.markMessagesAsRead(
      data.conversationId,
      data.messageIds,
    );

    this.server.to(data.conversationId).emit('messages_read', {
      messageIds: data.messageIds,
    });

    return {
      event: 'marked_as_read',
      data: { messageIds: data.messageIds },
    };
  }
}
