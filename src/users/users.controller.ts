import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  HttpStatus,
  Req,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Response } from 'express';
import { UpdatePatientDto, CreateUserDto } from '@src/users/dto/index.dto';
import { ApiCookieAuth, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import omit from 'lodash.omit';
import { UpdateConsultantDto } from '@src/consultant/dto/updateConsultantDto';
import type { Request } from '@src/types';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtAuthGuard: JwtAuthGuard,
  ) {}

  // ! create users
  @Post('signup')
  // @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() body: CreateUserDto,
    @Res({passthrough: true}) res: Response,
    @Req() req: Request,
  ) {
    const { user, accessToken, refreshToken } =
      await this.userService.createUser(body, 'local');

    const isMobileClient = this.jwtAuthGuard.isMobileClient(req);
    console.log(user, accessToken, refreshToken)
    if (isMobileClient) {
      res.setHeader('x-access-token', accessToken);
      res.setHeader('x-refresh-token', refreshToken);
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
    }

    const safeUser = omit(user, ['password', 'refreshToken']);

    return { sucess: true, data: safeUser };
  }

  //! get all users in db
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('get-all-users')
  async getAllUsers() {
    const users = await this.userService.getAllUsers();

    return { sucess: true, data: users };
  }

  // ! update patient information
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch('/update/patient')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async updatePatient(@Req() req: Request, @Body() body: UpdatePatientDto) {
    const { id: userId } = req.user;
    const user = await this.userService.updatePatient(body, userId);
    console.log(user);
    const safeUser = omit(user, [
      'password',
      'refreshToken',
      'authProvider',
      'role',
    ]);

    return { sucess: true, data: safeUser };
  }

  // ! update consultant information
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch('/update/consultant')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async updateConsultant(
    @Req() req: Request,
    @Body() body: UpdateConsultantDto,
  ) {
    const { id: userId } = req.user;
    const user = await this.userService.updatePatient(body, userId);
    console.log(user);
    const safeUser = omit(user, [
      'password',
      'refreshToken',
      'authProvider',
      'role',
    ]);

    return { sucess: true, data: safeUser };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('patient/profile-card')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async profileCardInfo(@Req() req: Request) {
    const { id: userId } = req.user;
    const data = await this.userService.profileCards(userId);


    return { sucess: true, data: data };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('/patient/profile')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async getPatientProfile(@Req() req: Request) {
    const { id: userId } = req.user;
    const user = await this.userService.getPatientProfile(userId);
    console.log('req.user', req.user);
    const safeUser = omit(user, [
      'password',
      'refreshToken',
      'authProvider',
      'role',
    ]);

    return { sucess: true, data: safeUser };
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Get('/consultant/profile')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async getConsultantProfile(@Req() req: Request) {
    const { id: userId } = req.user;
    const user = await this.userService.getConsultantProfile(userId);
    console.log('req.user', req.user);
    const safeUser = omit(user, [
      'password',
      'refreshToken',
      'authProvider',
      'role',
    ]);

    return { sucess: true, data: safeUser };
  }
}
