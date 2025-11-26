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

@Controller('prescription')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPrescription(
    @Body() body: CreatePrescriptionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { id: consultantId } = req.user;
    const prescription = await this.prescriptionService.create(
      body,
      consultantId,
      body.patientId,
    );

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: prescription });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant', 'patient')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const { id: userId } = req.user;
    const prescription = await this.prescriptionService.findAll(userId, userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: prescription });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Patch(':prescriptionId')
  async update(
    @Param('prescriptionId') prescriptionId: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: consultantId } = req.user;
    const prescription = await this.prescriptionService.update(
      prescriptionId,
      updatePrescriptionDto,
      consultantId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: prescription });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch(':prescriptionId/take-pill')
  async takePill(
    @Param('prescriptionId') prescriptionId: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body('dosage') dosage: number,
  ) {
    const { id: patientId } = req.user;
    const prescription = await this.prescriptionService.takePill(
      prescriptionId,
      dosage,
      patientId,
    );
    res.status(HttpStatus.OK).json({ message: 'success', data: prescription });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.prescriptionService.delete(id);
  }
}
