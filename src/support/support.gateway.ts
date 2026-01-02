// support.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportService } from '@src/support/support.service';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@src/auth/guards/ws-auth.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  namespace: '/support',
})
@UseGuards(WsAuthGuard)
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private supportService: SupportService,
    private jwtService: JwtService,
  ) {}

  // handleConnection(client: Socket) {
  //   const { userId, role } = client.handshake.auth;
  //   // console.log('client data user', client);
  //   client.data.user = { userId, role };

  //   if (role === 'agent') {
  //     this.supportService.registerAgent(userId, client.id);
  //   }
  // }

  async handleConnection(client: Socket) {
    try {
      console.log('=== CONNECTION ATTEMPT ===');
      console.log('Query:', client.handshake.query);
      console.log('Auth:', client.handshake.auth);

      let token: string | null = null;

      if (client.handshake.query?.token) {
        token = client.handshake.query.token as string;
        console.log('Token from query parameter', token);
      }
      else if (client.handshake.auth?.token) {
        token = client.handshake.auth.token;
        console.log('Token from auth field');
      }
      else if (client.handshake.headers.cookie) {
        token = this.extractTokenFromCookie(
          client.handshake.headers.cookie,
          'access_token',
        );
        console.log('Token from cookie');
      }

      if (!token) {
        console.log(' No token provided');
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Set user data
      client.data.user = {
        userId: payload.id,
        role: payload.role,
        email: payload.email,
      };

      console.log(
        `User authenticated: ${payload.id}, role: ${payload.role}`,
      );

      if (payload.role === 'agent') {
        this.supportService.registerAgent(payload.sub, client.id);
      }
    } catch (error) {
      console.error('Authentication failed:', error.message);
      client.disconnect();
    }
  }

  private extractTokenFromCookie(
    cookies: string,
    cookieName: string,
  ): string | null {
    if (!cookies) return null;
    const cookieArray = cookies.split(';');
    const authCookie = cookieArray.find((cookie) =>
      cookie.trim().startsWith(`${cookieName}=`),
    );
    return authCookie ? authCookie.split('=')[1].trim() : null;
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user?.role === 'agent') {
      this.supportService.unregisterAgent(user.userId);
    }
  }

  @SubscribeMessage('join_support')
  async joinConversation(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId } = payload;
    client.join(conversationId);

    const agent =
      await this.supportService.assignAgentIfPossible(conversationId);

    if (agent) {
      this.server.to(agent.socketId).emit('join_support', {
        conversationId,
      });
    }
  }

  @SubscribeMessage('send_support_message')
  async sendMessage(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, role } = client.data.user;

    const { conversationId, content } = payload;

    const message = await this.supportService.sendMessage({
      conversationId,
      senderId: userId,
      senderType: role,
      content,
    });

    this.server.to(conversationId).emit('new_support_message', message);
  }
}
