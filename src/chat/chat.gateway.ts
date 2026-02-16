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
  private userSockets = new Map<string, string>();

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
      const user = this.activeUsers.get(client.id);

       if (user) {
         this.userSockets.delete(user.userId);
       }

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
    this.userSockets.set(userId, client.id);

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

    if (!conversationInfo.bookingId)
      throw new BadRequestException('Could not get booking Id');

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
    @ConnectedSocket() client: Socket, // ✅ Uncomment this
  ) {
    try {
      // Validate input
      if (
        !data.conversationId ||
        !data.messageIds ||
        data.messageIds.length === 0
      ) {
        return {
          event: 'error',
          data: { message: 'Invalid data provided' },
        };
      }

      await this.chatService.markMessagesAsRead(
        data.conversationId,
        data.messageIds,
      );

      // ✅ Use broadcast to send ONLY to other clients, not the sender
      client.broadcast.to(data.conversationId).emit('messages_read', {
        conversationId: data.conversationId,
        messageIds: data.messageIds,
      });

      // This return only goes to the sender
      return {
        event: 'marked_as_read',
        data: {
          messageIds: data.messageIds,
          success: true,
        },
      };
    } catch (error) {
      return {
        event: 'error',
        data: {
          message: error.message || 'Failed to mark messages as read',
        },
      };
    }
  }

  @SubscribeMessage('call:initiate')
  handleCallInitiate(
    @MessageBody()
    data: { toUserId: string; conversationId: string; callType: 'video' | 'audio' },
    @ConnectedSocket() client: Socket,
  ) {

      const targetSocketId = this.userSockets.get(data.toUserId);
  if (!targetSocketId) return;

    // Notify the recipient about incoming call
    this.server.to(targetSocketId).emit('call:incoming', {
      fromUserId: this.activeUsers.get(client.id)?.userId,
      conversationId: data.conversationId,
      callType: data.callType,
    });
  }

  @SubscribeMessage('call:accept')
  handleCallAccept(
    @MessageBody() data: { toUserId: string },
    @ConnectedSocket() client: Socket,
  ) {

          const targetSocketId = this.userSockets.get(data.toUserId);

            if (!targetSocketId) return;


    this.server.to(targetSocketId).emit('call:accepted', {
      fromUserId: client.id,
    });
  }

  @SubscribeMessage('call:reject')
  handleCallReject(
    @MessageBody() data: { toUserId: string; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
              const targetSocketId = this.userSockets.get(data.toUserId);
                          if (!targetSocketId) return;


    this.server.to(targetSocketId).emit('call:rejected', {
      from: client.id,
      reason: data.reason,
    });
  }

  // WebRTC signaling
  @SubscribeMessage('webrtc:offer')
  handleOffer(
    @MessageBody() data: { to: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.to).emit('webrtc:offer', {
      from: client.id,
      offer: data.offer,
    });
  }

  @SubscribeMessage('webrtc:answer')
  handleAnswer(
    @MessageBody() data: { to: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.to).emit('webrtc:answer', {
      from: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('webrtc:ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { to: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.to).emit('webrtc:ice-candidate', {
      from: client.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('call:end')
  handleCallEnd(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.to).emit('call:ended', {
      from: client.id,
    });
  }
}
