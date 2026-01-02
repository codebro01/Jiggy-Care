// ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      throw new WsException('Unauthorized');
    }

    const token = this.extractTokenFromCookie(cookieHeader, 'access_token');
    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = {
        userId: payload.id,
        role: payload.role,
        email: payload.email,
      };

      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromCookie(cookies: string, name: string) {
    return cookies
      ?.split(';')
      .find((c) => c.trim().startsWith(`${name}=`))
      ?.split('=')[1];
  }
}

