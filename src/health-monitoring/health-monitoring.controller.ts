import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req, 
} from '@nestjs/common';
import { HealthMonitoringService } from './health-monitoring.service';
import { CreateHealthReadingDto } from '@src/health-monitoring/dto/create-health-monitoring.dto';
import { UpdateHealthReadingDto } from '@src/health-monitoring/dto/update-health-monitoring.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';

@Controller('health-monitoring')
export class HealthMonitoringController {
  constructor(
    private readonly healthMonitoringService: HealthMonitoringService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post()
  async createHealthReading(
    @Body() createDto: CreateHealthReadingDto,
    @Req() req: Request,
  ) {
    const { id: patientId } = req.user;

    return this.healthMonitoringService.createHealthReading(
      createDto,
      patientId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getAllHealthReadings() {
    return this.healthMonitoringService.getAllHealthReadings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('patient/:patientId')
  async getHealthReadingsByPatient(@Req() req: Request) {
    const patientId = req.user.id;
    return this.healthMonitoringService.getHealthReadingsByPatient(patientId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('patient/:patientId/latest')
  async getLatestReadingByPatient(@Req() req: Request) {
    const patientId = req.user?.id;
    return this.healthMonitoringService.getLatestReadingByPatient(patientId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get(':id')
  async getHealthReadingById(@Param('id') id: string) {
    return this.healthMonitoringService.getHealthReadingById(id);
  }

  @Put(':id')
  async updateHealthReading(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateDto: UpdateHealthReadingDto,
  ) {
    const patientId = req.user?.id
    return this.healthMonitoringService.updateHealthReading(
      id,
      patientId,
      updateDto,
    );
  }

  @Delete(':id')
  async deleteHealthReading(@Param('id') id: string, @Req() req: Request) {
    const patientId = req.user?.id;
    return this.healthMonitoringService.deleteHealthReading(id, patientId);
  }
}
