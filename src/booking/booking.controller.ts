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
  Patch,
  Param,
  ParseUUIDPipe,
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
  ApiOperation,
} from '@nestjs/swagger';
import { QueryBookingDto } from '@src/booking/dto/query-booking.dto';
import { PatientCompletedAppointmentDto } from '@src/booking/dto/patient-complete-appointment.dto';
import { ConsultantCompletedAppointmentDto } from '@src/booking/dto/consultant-complete-appointment.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

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
  @Roles('patient')
  @Patch(':bookingId/patient/completed')
  @ApiOperation({
    summary:
      'This endpoint allows patients to mark an appointment as completed',
    description:
      'When a user clicks on complete, it automatically sets the appointment to completed, and its only accessible to patients',
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
  async patientCompleteAppointment(
    @Req() req: Request,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() body: PatientCompletedAppointmentDto,
  ) {
    const { id: patientId } = req.user;
    const bookings = await this.bookingService.patientCompleteAppointment(
      bookingId,
      patientId,
      body.confirmed,
      body.reason,
    );
    console.log('bookings', bookings);
    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch(':bookingId/patient/mark-no-show')
  @ApiOperation({
    summary: 'This endpoint allows patients to mark an appointment as no show',
    description:
      'When a user clicks on no show, it automatically sets the appointment state to no show, meaning the consultant did not show up.The endpoint is only accessible to patients',
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
  async patientMarkNoShow(
    @Req() req: Request,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    const { id: patientId } = req.user;
    const bookings = await this.bookingService.patientMarkNoShow(
      bookingId,
      patientId,
    );
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
  @Roles('consultant')
  @Patch(':bookingId/consultant/start')
  @ApiOperation({
    summary:
      'This endpoint allows a consultant to mark an appointment in progress when they click on start',
    description:
      'When a consultant clicks on start, it automatically sets the appointment state to in_progresss.The endpoint is only accessible to consultant',
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
  async consultantStartAppointment(
    @Req() req: Request,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    const { id: patientId } = req.user;
    const bookings = await this.bookingService.consultantStartAppointment(
      bookingId,
      patientId,
    );
    console.log('bookings', bookings);
    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Patch(':bookingId/consultant/completed')
  @ApiOperation({
    summary:
      'This endpoint allows a consultant to mark an appointment as completed',
    description:
      'When a consultant clicks completed, it automatically sets the appointment state to pending_confirmation, meaning the patient the patient will have to also comfirm completed for the appointment to be truly completed',
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
  async consultantCompleteAppointment(
    @Req() req: Request,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() body: ConsultantCompletedAppointmentDto,
  ) {
    const { id: consultantId } = req.user;
    const bookings = await this.bookingService.consultantCompleteAppointment(
      bookingId,
      consultantId,
      body.notes,
    );
    console.log('bookings', bookings);
    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Patch(':bookingId/consultant/mark-no-show')
  @ApiOperation({
    summary:
      'This endpoint allows a consultant to mark an appointment as no show',
    description:
      'When a consultant clicks on no show, it automatically sets the appointment state to no show, meaning the patient did not show up.The endpoint is only accessible to consultant',
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
  async consultantMarkNoShow(
    @Req() req: Request,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    const { id: patientId } = req.user;
    const bookings = await this.bookingService.consultantMarkNoShow(
      bookingId,
      patientId,
    );
    console.log('bookings', bookings);
    return { success: true, data: bookings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('patient/:patientId/list')
  @ApiOperation({
    summary: 'This endpoint lists all patient bookings filter',
    description:
      'This endpoints list all patient bookings by filter such as completed, upcoming, etc. It is only accessible to admins',
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
  async getPatientAllBookings(@Query() query: QueryBookingDto, @Param('patientId', ParseUUIDPipe) patientId: string) {
    const bookings = await this.bookingService.getPatientAllBookings(query, patientId);

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
