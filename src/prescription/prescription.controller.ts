import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader } from '@nestjs/swagger';
import { CreateManyPrescriptionsDto } from '@src/prescription/dto/create-many-prescriptions.dto';

@Controller('prescription')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
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
  async createPrescription(
    @Body() body: CreatePrescriptionDto,
    @Req() req: Request,
  ) {
    const { id: consultantId } = req.user;
    const prescription = await this.prescriptionService.create(
      body,
      consultantId,
      body.patientId,
    );

    return { success: true, data: prescription };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Post('bulk')
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
  async createManyPrescriptions(
    @Body() body: CreateManyPrescriptionsDto,
    @Req() req: Request,
  ) {
    const { id: consultantId } = req.user;
    const prescriptions = await this.prescriptionService.createMany(
      body.prescriptions,
      consultantId,
      body.patientId,
    );

    return { success: true, data: prescriptions };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant', 'patient')
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
  async findAll(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;
    const prescription = await this.prescriptionService.findAll(userId, userId);
    return { success: true, data: prescription };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Patch(':prescriptionId')
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
  async update(
    @Param('prescriptionId') prescriptionId: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @Req() req: Request,
  ) {
    const { id: consultantId } = req.user;
    const prescription = await this.prescriptionService.update(
      prescriptionId,
      updatePrescriptionDto,
      consultantId,
    );

    return { success: true, data: prescription };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch(':prescriptionId/take-pill')
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
  async takePill(
    @Param('prescriptionId') prescriptionId: string,
    @Req() req: Request,
  ) {
    const { id: patientId } = req.user;
    const prescription = await this.prescriptionService.takePill(
      prescriptionId,
      patientId,
    );
    return { success: true, data: prescription };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.prescriptionService.delete(id);
  }
}
