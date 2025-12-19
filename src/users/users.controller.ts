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
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Response } from 'express';
import { UpdatePatientDto, CreateUserDto } from '@src/users/dto/index.dto';

import omit from 'lodash.omit';
import type { Request } from '@src/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ! create users
  @Post('signup')
  // @UseGuards(JwtAuthGuard)
  async createUser(@Body() body: CreateUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.userService.createUser(body, 'local');

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

    res
      .status(HttpStatus.ACCEPTED)
      .json({ user: safeUser, accessToken, refreshToken });
  }

  //! get all users in db
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('get-all-users')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ! update user basic information
  @UseGuards(JwtAuthGuard)
  @Patch('/update-user-basic-info')
  async updateUsers(@Req() req: Request, @Body() body: UpdatePatientDto) {
    const { id: userId } = req.user;
    const user = await this.userService.updateUser(userId, body);
    console.log(user);
    const safeUser = omit(user, ['password', 'refreshToken', 'authProvider', 'role']);

    return safeUser;
  }
}
