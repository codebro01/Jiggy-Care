import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  Get,
  Query,
  BadRequestException,
  UseGuards,
  Patch,
  HttpCode,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { LoginUserDto } from '@src/auth/dto/login-user.dto';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@src/users/users.service';
import omit from 'lodash.omit';
import {
  ApiTags,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from '@src/types';
import { roleType } from '@src/users/dto/createUser.dto';
import { GoogleMobileSigninDto } from '@src/auth/dto/google-mobile-signin.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';

@ApiTags('auth') // Groups your endpoints
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private jwtAuthGuard: JwtAuthGuard,
    private readonly userService: UserService,
  ) {}

  // ! local signin (password and email)
  @Post('signin')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async loginUser(
    @Body() body: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() request: Request,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.loginUser(body);

    const isMobileClient = this.jwtAuthGuard.isMobileClient(request);
    await this.authService.loginUser(body);
    const safeUser = omit(user, ['password', 'refreshToken', 'authProvider']);

    if (isMobileClient) {
      res.setHeader('x-access-token', accessToken);
      res.setHeader('x-refresh-token', refreshToken);
      return {
        sucess: true,
        data: safeUser,
      };
    } else {
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1h
      });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
      });
      return {
        sucess: true,
        data: safeUser,
      };
    }
  }

  // ! call google api for sign in or signup with google for mobile

  @Get('google/mobile-signin')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  async googleLoginForMobile(
    @Res({ passthrough: true }) res: Response,
    @Query() query: GoogleMobileSigninDto,
  ) {
    if (query.role !== roleType.PATIENT && query.role !== roleType.CONSULTANT)
      throw new BadRequestException('invalid role');

    const { user, accessToken, refreshToken } =
      await this.authService.googleMobileAuth(query);

    res.setHeader('x-access-token', accessToken);
    res.setHeader('x-refresh-token', refreshToken);
    return {
      sucess: true,
      data: user,
    };
  }
  // ! call google api for sign in or signup with google for web

  @Get('google/web-signin')
  googleLoginForWeb(@Res() res: Response, @Query('role') role: roleType) {
    if (role !== roleType.PATIENT && role !== roleType.CONSULTANT)
      throw new BadRequestException('invalid role');

    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    console.log(state);
    const googleUrl = this.authService.googleWebAuth(state);
    res.redirect(googleUrl);
  }

  // ! google callback  for signin or signup (this callback returns the user identity from google)

  @Get('google/callback')
  @HttpCode(HttpStatus.OK)
  async googleCallbackForWeb(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.googleAuthCallbackForWeb(code, state);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1h
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    });


    return { success: true, data: user };
  }

  @Patch('refresh')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile'],
      example: 'mobile',
    },
  })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'The refresh token that was sent to the client during login',
    required: true,
    schema: {
      type: 'string',
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsxxxxxxxxxxxxxxxxxxx',
    },
  })
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const isMobileClient = this.jwtAuthGuard.isMobileClient(req);
    if (!isMobileClient)
      throw new BadRequestException(
        'Only mobile is allowed to use this route!',
      );
    const refreshToken = this.jwtAuthGuard.extractRefreshToken(req);
    if (!refreshToken)
      throw new BadRequestException('No refresh token provided');
    const newTokens =
      await this.authService.verifyRefreshTokenForMobile(refreshToken);
       console.log(newTokens)
    if (!newTokens?.newAccessToken || !newTokens?.newRefreshToken)
      throw new InternalServerErrorException('Could not issue new tokens');

    res.setHeader('x-access-token', newTokens?.newAccessToken);
    res.setHeader('x-refresh-token', newTokens?.newRefreshToken);
    return {
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'consultant', 'admin')
  @Get('logout')
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  async logoutUser(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;
    await this.authService.logoutUser(userId);
    const isMobileClient = this.jwtAuthGuard.isMobileClient(req);

    if (!isMobileClient) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
    } else {
      res.removeHeader('x-access-token');
      res.removeHeader('x-refresh-token');
    }
    return {
      success: true,
      message: 'logout successful',
    };
  }
}
