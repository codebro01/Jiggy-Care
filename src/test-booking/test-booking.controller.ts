import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TestBookingService } from './test-booking.service';
import { CreateTestBookingDto } from './dto/create-test-booking.dto';
import { UpdateTestBookingDto } from './dto/update-test-booking.dto';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';

@Controller('test-booking')
export class TestBookingController {
  constructor(private readonly testBookingService: TestBookingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post()
  async create(
    @Body() createTestBookingDto: CreateTestBookingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.create(
      createTestBookingDto,
      patientId,
    );

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: testBooking });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.findAll(patientId);

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: testBooking });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get(':id')
  async findOne(
    @Param('id') testBookingId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.findOne(
      testBookingId,
      patientId,
    );

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: testBooking });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') testBookingId: string,
    @Body() data: UpdateTestBookingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: patientId } = req.user;
    const testBooking = await this.testBookingService.update(
      data,
      testBookingId,
      patientId,
    );

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: testBooking });
  }
}
