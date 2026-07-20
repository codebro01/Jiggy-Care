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
import { FcmService } from '@src/fcm/fcm.service';

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
    private readonly fcmService: FcmService,
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
    const { conversationId, content, senderType, fileUrl, fileType } = data;

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

    if (!conversationId || !senderType || (!content && !fileUrl)) {
      return {
        event: 'error',
        data: { message: 'Missing required fields' },
      };
    }

    if (!conversationInfo.bookingId)
      throw new BadRequestException('Could not get booking Id');

    console.log(
      'entered about sending the message to the user',
      fileUrl,
      fileType,
    );

    try {
      const result = await this.chatService.sendMessage({
        bookingId: conversationInfo.bookingId,
        consultantId: conversationInfo?.consultantId,
        patientId: conversationInfo?.patientId,
        content,
        senderType,
        fileUrl,
        fileType,
      });

      // console.log(
      //   'Sockets in room:',
      //   await this.server.in(conversationId).fetchSockets(),
      // );
      console.log(`Broadcasting to room: ${conversationId}`);
      this.server.to(conversationId).emit('new_message', result);
      console.log('Event emitted successfully', result);

      const patientInfo = await this.userRepository.findUserById(
        conversationInfo.patientId,
      );
      const consultantInfo = await this.userRepository.findUserById(
        conversationInfo.consultantId,
      );

      const isPatientSender = senderType === 'patient'; // or whatever your enum value is

      const sender = isPatientSender ? patientInfo : consultantInfo;
      const receiver = isPatientSender ? consultantInfo : patientInfo;

      this.oneSignalService
        .sendNotificationToUser(
          receiver.id,
          `New message from ${sender.fullName}`,
          content || '📎 Sent an attachment',
          {
            category: 'Message',
            action: 'New Message',
            conversationId,
            bookingId: conversationInfo.bookingId,
          },
        )
        .catch((err) => console.error('Error sending notification:', err));
      return {
        event: 'message_sent',
        data: result,
      };
    } catch (error: any) {
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
    } catch (error: any) {
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

  //   if (!fromUserId) return;

  //   const user = await this.userRepository.findUserById(fromUserId);

  //    const conversationInfo =
  //      await this.chatService.getConversationByConversationId(data.conversationId);

  //      if(!conversationInfo) throw new BadRequestException('Invalid conversation')

  //   await this.oneSignalService.sendNotificationToUser(
  //     data.toUserId,
  //     `Incoming call from ${user.fullName}`,
  //     `Open app to answer`,
  //     {
  //       category: 'Call',
  //       action: 'Incoming Call',
  //       conversationId: data.conversationId,
  //       callType: data.callType,
  //       callerName: user.fullName,
  //       bookingId: conversationInfo.bookingId,
  //       fromUserId,
  //     },
  //   );

  //   if (targetSocketId) {
  //     client.emit('call:ringing', {
  //       toUserId: data.toUserId,
  //       conversationId: data.conversationId,
  //       callType: data.callType,
  //     });

  //     this.server.to(targetSocketId).emit('call:incoming', {
  //       fromUserId,
  //       conversationId: data.conversationId,
  //       callType: data.callType,
  //     });

  //     const ringingTimeout = setTimeout(() => {
  //       client.emit('call:no-answer', { toUserId: data.toUserId });
  //       this.server.to(targetSocketId).emit('call:missed', {
  //         fromUserId,
  //         conversationId: data.conversationId,
  //       });
  //       this.activeRingingCalls.delete(fromUserId);
  //     }, 45000);

  //     this.activeRingingCalls.set(fromUserId, ringingTimeout);
  //   }
  // }

  // Add this to your Gateway class properties
  private activeCallNotifications = new Set<string>(); // ✅ tracks notified calls

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
    const receiver = await this.userRepository.findUserById(data.toUserId); // ✅ Get receiver for FCM token

    const conversationInfo =
      await this.chatService.getConversationByConversationId(
        data.conversationId,
      );

    if (!conversationInfo)
      throw new BadRequestException('Invalid conversation');

    // ✅ Only send notification once per unique call
    if (!this.activeCallNotifications.has(data.conversationId)) {
      this.activeCallNotifications.add(data.conversationId);

      if (receiver.fcmToken) {
        await this.fcmService
          .sendCallNotification(receiver.fcmToken, {
            callId: data.conversationId, // or a dedicated callId if you have one
            callerName: user.fullName,
            callerUserId: fromUserId,
            conversationId: data.conversationId,
            callType: data.callType,
            bookingId: conversationInfo.bookingId,
          })
          .catch((err) => console.error('FCM call notification error:', err));
      }

      // ✅ Keep OneSignal as fallback for users without FCM token
      if (!receiver.fcmToken) {
        await this.oneSignalService
          .sendNotificationToUser(
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
          )
          .catch((err) =>
            console.error('OneSignal call notification error:', err),
          );
      }
      // ✅ Clean up after 60s so future calls on same conversation work
      setTimeout(() => {
        this.activeCallNotifications.delete(data.conversationId);
      }, 60000);
    }

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
        this.activeCallNotifications.delete(data.conversationId); // ✅ also clean up on no-answer
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
  async handleCallReject(
    // add async
    @MessageBody()
    data: { toUserId: string; reason?: string; conversationId: string }, // add conversationId
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocketId = this.userSockets.get(data.toUserId);
    const rejectingUserId = this.activeUsers.get(client.id)?.userId;

    if (!targetSocketId) return;

    const ringingTimeout = this.activeRingingCalls.get(data.toUserId);
    if (ringingTimeout) {
      clearTimeout(ringingTimeout);
      this.activeRingingCalls.delete(data.toUserId);
    }

    this.server.to(targetSocketId).emit('call:rejected', {
      fromUserId: rejectingUserId,
      reason: data.reason || 'Call declined',
    });

    // FCM fallback — tells caller's device the call was rejected
    const caller = await this.userRepository.findUserById(data.toUserId);
    if (caller?.fcmToken) {
      await this.fcmService
        .sendCallEndedNotification(caller.fcmToken, {
          callId: data.conversationId,
          conversationId: data.conversationId,
          reason: 'rejected',
        })
        .catch((err) => console.error('FCM call rejected error:', err));
    }
  }

  // @SubscribeMessage('call:reject')
  // handleCallReject(
  //   @MessageBody() data: { toUserId: string; reason?: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const targetSocketId = this.userSockets.get(data.toUserId);
  //   const rejectingUserId = this.activeUsers.get(client.id)?.userId; // ✅ Add this

  //   if (!targetSocketId) return;

  //   // Clear the ringing timeout since call was rejected
  //   const ringingTimeout = this.activeRingingCalls.get(data.toUserId);
  //   if (ringingTimeout) {
  //     clearTimeout(ringingTimeout);
  //     this.activeRingingCalls.delete(data.toUserId);
  //   }

  //   // Stop ringing and notify caller of rejection
  //   this.server.to(targetSocketId).emit('call:rejected', {
  //     fromUserId: rejectingUserId, // ✅ Changed from client.id
  //     reason: data.reason || 'Call declined',
  //   });
  // }



  @SubscribeMessage('call:end')
  async handleCallEnd(
    // add async
    @MessageBody() data: { toUserId: string; conversationId: string }, // add conversationId
    @ConnectedSocket() client: Socket,
  ) {
    const targetSocketId = this.userSockets.get(data.toUserId);
    const endingUserId = this.activeUsers.get(client.id)?.userId;

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

    if (targetSocketId) {
      this.server.to(targetSocketId).emit('call:ended', {
        fromUserId: endingUserId,
      });
    }

    // FCM fallback — dismisses Notifee notification if app is backgrounded/killed
    const receiver = await this.userRepository.findUserById(data.toUserId);
    if (receiver?.fcmToken) {
      await this.fcmService
        .sendCallEndedNotification(receiver.fcmToken, {
          callId: data.conversationId,
          conversationId: data.conversationId,
          reason: 'ended',
        })
        .catch((err) => console.error('FCM call ended error:', err));
    }
  }
  // @SubscribeMessage('call:end')
  // handleCallEnd(
  //   @MessageBody() data: { toUserId: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const targetSocketId = this.userSockets.get(data.toUserId);
  //   const endingUserId = this.activeUsers.get(client.id)?.userId;

  //   if (!targetSocketId) return;

  //   // Clear any ringing timeout
  //   if (endingUserId) {
  //     const ringingTimeout = this.activeRingingCalls.get(endingUserId);
  //     if (ringingTimeout) {
  //       clearTimeout(ringingTimeout);
  //       this.activeRingingCalls.delete(endingUserId);
  //     }
  //   }

  //   const callerTimeout = this.activeRingingCalls.get(data.toUserId);
  //   if (callerTimeout) {
  //     clearTimeout(callerTimeout);
  //     this.activeRingingCalls.delete(data.toUserId);
  //   }

  //   this.server.to(targetSocketId).emit('call:ended', {
  //     fromUserId: endingUserId, // ✅ Changed from client.id to endingUserId
  //   });
  // }
}
