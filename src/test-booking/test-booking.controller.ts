import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  HttpStatus,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { TestBookingService } from './test-booking.service';
import { CreateTestBookingDto } from './dto/create-test-booking.dto';
import { UpdateTestBookingDto } from './dto/update-test-booking.dto';
import type { Request } from '@src/types';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader } from '@nestjs/swagger';

@Controller('test-booking')
export class TestBookingController {
  constructor(private readonly testBookingService: TestBookingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post()
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
  async create(
    @Body() createTestBookingDto: CreateTestBookingDto,
    @Req() req: Request
  ) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.create(
      createTestBookingDto,
      patientId,
    );

   return {success: true, data: testBooking}
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get()
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
  async findAll(@Req() req: Request) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.findAll(patientId);

   return {success: true, data: testBooking}
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get(':id')
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
  async findOne(
    @Param('id') testBookingId: string,
    @Req() req: Request,

  ) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.findOne(
      testBookingId,
      patientId,
    );

   return {success: true, data: testBooking}
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
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
  async update(
    @Param('id') testBookingId: string,
    @Body() data: UpdateTestBookingDto,
    @Req() req: Request,

  ) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.update(
      data,
      testBookingId,
      patientId,
    );

   return {success: true, data: testBooking}
  }
}
