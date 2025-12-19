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
} from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { LoginUserDto } from '@src/auth/dto/login-user.dto';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@src/users/users.service';
import omit from 'lodash.omit'
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Request } from '@src/types';
import { roleType } from '@src/users/dto/createUser.dto';



@ApiTags('auth') // Groups your endpoints
@Controller('auth')
export class AuthController {
 
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // ! local signin (password and email)
  @Post('signin')
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async loginUser(@Body() body: LoginUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.loginUser(body);

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

    const safeUser = omit(user, ['password', 'refreshToken', 'authProvider']);

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser, accessToken });
  }

  // ! call google api for sign in or signup with google

  @Get('google')
  googleLogin(@Res() res: Response, @Query('role') role: roleType) {
    if (role !== roleType.PATIENT && role !== roleType.CONSULTANT)
      throw new BadRequestException('invalid role');

    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    console.log(state);
    const googleUrl = this.authService.googleAuth(state);
    res.redirect(googleUrl);
  }

  // ! google callback  for signin or signup (this callback returns the user identity from google)

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.googleAuthCallback(code, state);

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

    const safeUser = omit(user, ['password', 'refreshToken']);

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser, accessToken });
  }

  @Get('logout')
  async logoutUser(@Res() res: Response, @Req() req: Request) {
    const {id: userId} = req.user;
    await this.authService.logoutUser(userId);

    res.status(HttpStatus.OK).json({ message: 'Logout Successful' });
  }
}
