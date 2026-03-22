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
import { OneSignalService } from '@src/one-signal/one-signal.service';
import { UserRepository } from '@src/users/repository/user.repository';

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
  private activeRingingCalls = new Map<string, NodeJS.Timeout>(); // Track ringing timeouts

  constructor(
    private chatService: ChatService,
    private readonly oneSignalService: OneSignalService,
    private readonly userRepository: UserRepository,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.activeUsers.get(client.id);

    if (user) {
      this.userSockets.delete(user.userId);

      // Clear any active ringing timeout for this user
      const ringingTimeout = this.activeRingingCalls.get(user.userId);
      if (ringingTimeout) {
        clearTimeout(ringingTimeout);
        this.activeRingingCalls.delete(user.userId);
      }
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

      const patientInfo = await this.userRepository.findUserById(
        conversationInfo.patientId,
      );
      const consultantInfo = await this.userRepository.findUserById(
        conversationInfo.consultantId,
      );

      const isPatientSender = senderType === 'patient'; // or whatever your enum value is

      const sender = isPatientSender ? patientInfo : consultantInfo;
      const receiver = isPatientSender ? consultantInfo : patientInfo;

      this.oneSignalService.sendNotificationToUser(
        receiver.id,
        `New message from ${sender.fullName}`,
        content,
        {
          category: 'Message',
          action: 'New Message',
          conversationId,
          bookingId: conversationInfo.bookingId
        },
      );

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

  // @SubscribeMessage('call:initiate')
  // async handleCallInitiate(
  //   @MessageBody()
  //   data: {
  //     toUserId: string;
  //     conversationId: string;
  //     callType: 'video' | 'audio';
  //   },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const targetSocketId = this.userSockets.get(data.toUserId);
  //   const fromUserId = this.activeUsers.get(client.id)?.userId;

  //   if (!targetSocketId || !fromUserId) return;

  //   // Start ringing on the caller's side
  //   client.emit('call:ringing', {
  //     toUserId: data.toUserId,
  //     conversationId: data.conversationId,
  //     callType: data.callType,
  //   });

  //   // Notify the recipient about incoming call
  //   this.server.to(targetSocketId).emit('call:incoming', {
  //     fromUserId,
  //     conversationId: data.conversationId,
  //     callType: data.callType,
  //   });

  //   const user = await this.userRepository.findUserById(fromUserId)

  //   this.oneSignalService.sendNotificationToUser(
  //     data.toUserId,
  //     `Incoming call from ${user.fullName}`,
  //     ``,
  //     {
  //       category: 'Call',
  //       action: 'Incoming Call',
  //     },
  //   );

  //   // Set a timeout for no answer (e.g., 45 seconds)
  //   const ringingTimeout = setTimeout(() => {
  //     // Notify caller that call was not answered
  //     client.emit('call:no-answer', {
  //       toUserId: data.toUserId,
  //     });

  //     // Notify recipient that call timed out
  //     this.server.to(targetSocketId).emit('call:missed', {
  //       fromUserId,
  //       conversationId: data.conversationId,
  //     });

  //     this.activeRingingCalls.delete(fromUserId);
  //   }, 45000); // 45 seconds

  //   this.activeRingingCalls.set(fromUserId, ringingTimeout);
  // }

  @SubscribeMessage('call:initiate')
  async handleCallInitiate(
    @MessageBody()
    data: {
      toUserId: string;
      conversationId: string;
      callType: 'video' | 'audio';
    },
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocketId = this.userSockets.get(data.toUserId);
    const fromUserId = this.activeUsers.get(client.id)?.userId;

    if (!fromUserId) return; 

    const user = await this.userRepository.findUserById(fromUserId);

     const conversationInfo =
       await this.chatService.getConversationByConversationId(data.conversationId);

       if(!conversationInfo) throw new BadRequestException('Invalid conversation')

    await this.oneSignalService.sendNotificationToUser(
      data.toUserId,
      `Incoming call from ${user.fullName}`,
      `Open app to answer`,
      {
        category: 'Call',
        action: 'Incoming Call',
        conversationId: data.conversationId,
        callType: data.callType,
        callerName: user.fullName, 
        bookingId: conversationInfo.bookingId, 
        fromUserId, 
      },
    );

    if (targetSocketId) {
      client.emit('call:ringing', {
        toUserId: data.toUserId,
        conversationId: data.conversationId,
        callType: data.callType,
      });

      this.server.to(targetSocketId).emit('call:incoming', {
        fromUserId,
        conversationId: data.conversationId,
        callType: data.callType,
      });

      const ringingTimeout = setTimeout(() => {
        client.emit('call:no-answer', { toUserId: data.toUserId });
        this.server.to(targetSocketId).emit('call:missed', {
          fromUserId,
          conversationId: data.conversationId,
        });
        this.activeRingingCalls.delete(fromUserId);
      }, 45000);

      this.activeRingingCalls.set(fromUserId, ringingTimeout);
    }
  }
  @SubscribeMessage('call:accept')
  handleCallAccept(
    @MessageBody() data: { toUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocketId = this.userSockets.get(data.toUserId);
    const acceptingUserId = this.activeUsers.get(client.id)?.userId;

    if (!targetSocketId) return;

    // Clear the ringing timeout since call was accepted
    const ringingTimeout = this.activeRingingCalls.get(data.toUserId);
    if (ringingTimeout) {
      clearTimeout(ringingTimeout);
      this.activeRingingCalls.delete(data.toUserId);
    }

    // Stop ringing on caller's side
    this.server.to(targetSocketId).emit('call:stop-ringing');

    // Notify caller that call was accepted
    this.server.to(targetSocketId).emit('call:accepted', {
      fromUserId: acceptingUserId,
    });

    // Confirm to accepter
    client.emit('call:connected');
  }

  @SubscribeMessage('call:reject')
  handleCallReject(
    @MessageBody() data: { toUserId: string; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocketId = this.userSockets.get(data.toUserId);
    const rejectingUserId = this.activeUsers.get(client.id)?.userId; // ✅ Add this

    if (!targetSocketId) return;

    // Clear the ringing timeout since call was rejected
    const ringingTimeout = this.activeRingingCalls.get(data.toUserId);
    if (ringingTimeout) {
      clearTimeout(ringingTimeout);
      this.activeRingingCalls.delete(data.toUserId);
    }

    // Stop ringing and notify caller of rejection
    this.server.to(targetSocketId).emit('call:rejected', {
      fromUserId: rejectingUserId, // ✅ Changed from client.id
      reason: data.reason || 'Call declined',
    });
  }

  // WebRTC signaling
  @SubscribeMessage('webrtc:offer')
  handleOffer(
    @MessageBody() data: { toUserId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      '📨 Received webrtc:offer from:',
      client.id,
      '→ to:',
      data.toUserId,
    );

    const targetSocketId = this.userSockets.get(data.toUserId);
    const fromUserId = this.activeUsers.get(client.id)?.userId; // ✅ Add this

    console.log('🎯 Target socket found:', targetSocketId ?? 'NOT FOUND');

    if (!targetSocketId || !fromUserId) return; // ✅ Check both

    this.server.to(targetSocketId).emit('webrtc:offer', {
      fromUserId, // ✅ Changed from client.id to fromUserId
      offer: data.offer,
    });
    console.log('✅ Offer forwarded to:', targetSocketId);
  }

  @SubscribeMessage('webrtc:answer')
  handleAnswer(
    @MessageBody()
    data: { toUserId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      '📨 Received webrtc:answer from:',
      client.id,
      '→ to:',
      data.toUserId,
    );

    const targetSocketId = this.userSockets.get(data.toUserId);
    const fromUserId = this.activeUsers.get(client.id)?.userId; // ✅ Get real user ID

    console.log('🎯 Target socket found:', targetSocketId ?? 'NOT FOUND');

    if (!targetSocketId || !fromUserId) return;

    this.server.to(targetSocketId).emit('webrtc:answer', {
      fromUserId, // ✅ Now sending actual user ID
      answer: data.answer,
    });
    console.log('✅ Answer forwarded to:', targetSocketId);
  }

  @SubscribeMessage('webrtc:ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { toUserId: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      '🧊 Received ICE candidate from:',
      client.id,
      '→ to:',
      data.toUserId,
    );

    const targetSocketId = this.userSockets.get(data.toUserId);
    const fromUserId = this.activeUsers.get(client.id)?.userId; // ✅ Add this

    console.log('🎯 Target socket found:', targetSocketId ?? 'NOT FOUND');

    if (!targetSocketId || !fromUserId) return; // ✅ Check both

    this.server.to(targetSocketId).emit('webrtc:ice-candidate', {
      fromUserId, // ✅ Changed from client.id to fromUserId
      candidate: data.candidate,
    });
    console.log('✅ ICE candidate forwarded');
  }
  @SubscribeMessage('call:end')
  handleCallEnd(
    @MessageBody() data: { toUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocketId = this.userSockets.get(data.toUserId);
    const endingUserId = this.activeUsers.get(client.id)?.userId;

    if (!targetSocketId) return;

    // Clear any ringing timeout
    if (endingUserId) {
      const ringingTimeout = this.activeRingingCalls.get(endingUserId);
      if (ringingTimeout) {
        clearTimeout(ringingTimeout);
        this.activeRingingCalls.delete(endingUserId);
      }
    }

    const callerTimeout = this.activeRingingCalls.get(data.toUserId);
    if (callerTimeout) {
      clearTimeout(callerTimeout);
      this.activeRingingCalls.delete(data.toUserId);
    }

    this.server.to(targetSocketId).emit('call:ended', {
      fromUserId: endingUserId, // ✅ Changed from client.id to endingUserId
    });
  }
}
