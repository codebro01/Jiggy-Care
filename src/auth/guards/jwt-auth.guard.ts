import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { jwtConstants } from '@src/auth/jwtContants';
import { userTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Request } from '@src/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db/users')>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const access_token = this.extractAccessToken(request);
    const refresh_token = this.extractRefreshToken(request); // for browser cookies // for mobile apps

    if (!access_token && !refresh_token) {
      throw new UnauthorizedException('Unauthorized to access this route');
    }

    const isMobileClient = this.isMobileClient(request);

    console.log('isMobileClient', isMobileClient);

    if (access_token) {
      try {
        const payload = await this.jwtService.verifyAsync(access_token, {
          secret: jwtConstants.accessTokenSecret,
        });
        if (!payload) throw new UnauthorizedException('authorization error');

        // const payload = this.jwtService.verify(payload); // verify with secret
        request['user'] = payload; // attach user to request
        return true;
      } catch (error) {
        console.log(error);
        if (!refresh_token) {
          response.redirect('/signin');
          throw new UnauthorizedException('Unauthorized to access this route');
        }

        console.log('malfunctioned here', refresh_token, access_token);

        const payload = await this.jwtService.verifyAsync(refresh_token, {
          secret: jwtConstants.refreshTokenSecret,
        });

        console.log(refresh_token, access_token);

        if (!payload) {
          throw new UnauthorizedException('Unauthorized to access this route');
        }

        const { email, id, role } = payload;

        const newAccessToken = await this.jwtService.signAsync(
          { email, id, role },
          {
            secret: jwtConstants.accessTokenSecret,
          },
        );
        const newRefreshToken = await this.jwtService.signAsync(
          { email, id, role },
          {
            secret: jwtConstants.refreshTokenSecret,
          },
        );

        response.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'development' ? false : true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60, // 1h
        });
        response.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'development' ? false : true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
        });

        const newTokenUser = await this.jwtService.verifyAsync(newAccessToken, {
          secret: jwtConstants.accessTokenSecret,
        });

        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

        await this.DbProvider.update(userTable)
          .set({ refreshToken: hashedNewRefreshToken })
          .where(eq(userTable.id, id));
        if (!newTokenUser) {
          response.clearCookie('access_token');
          response.clearCookie('refresh_token');
          throw new UnauthorizedException('Token issue failed!!!');
        }

        request['user'] = newTokenUser; // attach user to request
        return true;
      }
    }

    if (!refresh_token) {
     
        response.redirect('/signin');
        throw new UnauthorizedException('Unauthorized to access this route');
    }

    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: jwtConstants.refreshTokenSecret,
      });

      const { email, id, role } = payload;

      // Generate new tokens
      const newAccessToken = await this.jwtService.signAsync(
        { email, id, role },
        {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        },
      );

      const newRefreshToken = await this.jwtService.signAsync(
        { email, id, role },
        {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        },
      );

      // Send tokens based on client type
      if (isMobileClient) {
        // For mobile: Send tokens in response headers
        response.setHeader('x-access-token', newAccessToken);
        response.setHeader('x-refresh-token', newRefreshToken);
      } else {
        // For web: Set HTTP-only cookies
        response.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60, // 1h
        });
        response.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
        });
      }

      // Hash and store refresh token in database
      const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

      await this.DbProvider.update(userTable)
        .set({ refreshToken: hashedNewRefreshToken })
        .where(eq(userTable.id, id));

      // Verify new access token and attach user to request
      const newTokenUser = await this.jwtService.verifyAsync(newAccessToken, {
        secret: jwtConstants.accessTokenSecret,
      });

      if (!newTokenUser) {
        if (!isMobileClient) {
          response.clearCookie('access_token');
          response.clearCookie('refresh_token');
        }
        throw new UnauthorizedException('Token refresh failed');
      }

      request['user'] = newTokenUser;
      return true;
    } catch (refreshError) {
      console.log('refresh Error', refreshError);
      if (!isMobileClient) {
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        response.redirect('/signin');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  isMobileClient(request: Request): boolean {
    const clientType = request.headers['x-client-type'];
    if (clientType === 'mobile') return true;

    const hasAuthHeader = !!request.headers['authorization'];
    const hasCookies = !!request.cookies?.access_token;

    if (hasAuthHeader && !hasCookies) return true;

    const userAgent = request.headers['user-agent']?.toLowerCase() || '';
    return /mobile|android|iphone|ipad|okhttp|axios/.test(userAgent);
  }

  private extractAccessToken(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return request.cookies?.access_token;
  }

   extractRefreshToken(request: Request): string | undefined {
    const headerToken = request.headers['x-refresh-token'];
    if (headerToken) return headerToken as string;

    return request.cookies?.refresh_token;
  }

}
