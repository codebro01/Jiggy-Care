import { Controller, Post, UseGuards, Res, Req, Body, HttpStatus, Query, HttpCode, Get} from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { RatingService } from '@src/rating/rating.service';
import { CreateRatingDto } from './dto/createRatingDto';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { ApiHeader, ApiCookieAuth, ApiBearerAuth } from '@nestjs/swagger';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post('create')
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
  async createRating(
    @Body() body: CreateRatingDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const rating = await this.ratingService.createRating(
      body,
      req.user.id,
      body.consultantId,
    );

    return { success: true, data: rating };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('/consultant')
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
  async findConsultantRating(@Query('consultantId') consultantId: string) {
    const rating = await this.ratingService.findConsultantRatings(consultantId);

    return { success: true, data: rating };
  }
}
