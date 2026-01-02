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

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private supportService: SupportService) {}

  handleConnection(client: Socket) {
    const { userId, role } = client.handshake.auth;

    client.data.user = { userId, role };

    if (role === 'agent') {
      this.supportService.registerAgent(userId, client.id);
    }
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
    const {conversationId} = payload;
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

    const {conversationId, content} = payload;

    const message = await this.supportService.sendMessage({
      conversationId,
      senderId: userId,
      senderType: role,
      content,
    });

    this.server.to(conversationId).emit('new_support_message', message);
  }
}
