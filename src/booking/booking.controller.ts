import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  HttpStatus,
  Get,
  Query,
  HttpCode,
} from '@nestjs/common';
import { BookingService } from '@src/booking/booking.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { CreateBookingDto } from './dto/createBooking.dto';
import type { Request } from '@src/types';
import { FindAvailableSlotDto } from '@src/booking/dto/find-available-slot.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiCookieAuth,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { QueryBookingDto } from '@src/booking/dto/query-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiTags('patient-booking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('available-slots/:consultantId')
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
  async getAvailableSlots(@Query() query: FindAvailableSlotDto) {
    console.log('consultantId in controller', query.consultantId);

    return this.bookingService.getAvailableSlots(
      query.consultantId,
      query.date,
    );
  }

  @ApiTags('patient-booking')
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() body: CreateBookingDto, @Req() req: Request) {
    // Validate slot is available
    // console.log('consultantId in controller', body.consultantId);
    await this.bookingService.validateBookingSlot(body.date, body.consultantId);

    console.log('got past validateBookingSlot');

    // Create booking
    const booking = await this.bookingService.createBooking(
      body,
      req.user.id,
      body.consultantId,
    );

    return { success: true, data: booking };
  }

  @ApiTags('patient-booking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('patient/upcoming')
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async getPatientUpcomingBookings(@Req() req: Request) {
    const { id: userId } = req.user;
    const bookings =
      await this.bookingService.getPatientUpcomingBookings(userId);
    return { success: true, data: bookings };
  }

  @ApiTags('patient-booking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('patient/completed')
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async getPatientCompletedBookings(@Req() req: Request) {
    const { id: userId } = req.user;
    const bookings =
      await this.bookingService.getPatientCompletedBookings(userId);
    console.log('bookings', bookings);
    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Get('consultant/upcoming')
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async getConsultantUpcomingBookings(@Req() req: Request) {
    const { id: userId } = req.user;
    const bookings =
      await this.bookingService.getConsultantUpcomingBookings(userId);

    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Get('consultant/all')
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async getConsultantAllBookings(@Req() req: Request) {
    const { id: userId } = req.user;
    const bookings = await this.bookingService.getConsultantAllBookings(userId);

    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Get('consultant/completed')
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async getConsultantCompletedBookings(@Req() req: Request) {
    const { id: userId } = req.user;
    const bookings =
      await this.bookingService.getConsultantCompletedBookings(userId);

    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/list')
  @ApiOperation({
    summary: 'This endpoint lists all bookings by filter',
    description:
      'This endpoints list bookings by filter such as completed, upcoming, etc. It is only accessible to admins',
  })
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
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async listBookingsByFilter(@Query() query: QueryBookingDto) {
    const bookings = await this.bookingService.listBookingsByFilter(query);

    return { success: true, data: bookings };
  }
}
