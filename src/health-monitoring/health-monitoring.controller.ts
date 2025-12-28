import {
  Controller,
  Post,
  Get,
  Patch,
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
import { ApiBearerAuth, ApiHeader, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

@Controller('health-monitoring')
export class HealthMonitoringController {
  constructor(
    private readonly healthMonitoringService: HealthMonitoringService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post()
  @ApiOperation({
    summary: 'Create an health reading',
    description:
      'This endpoint is used to create and health reading. Accessible to patients only',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async createHealthReading(
    @Body() createDto: CreateHealthReadingDto,
    @Req() req: Request,
  ) {
    const { id: patientId } = req.user;

    const healthMonitoring =
      await this.healthMonitoringService.createHealthReading(
        createDto,
        patientId,
      );

    return { success: true, data: healthMonitoring };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  @ApiOperation({
    summary: 'Get all health reading in the  db',
    description:
      'This endpoint is used to get all health readings in the DB. Accessible to admins only',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async getAllHealthReadings() {
    const healthMonitoring =
      await this.healthMonitoringService.getAllHealthReadings();

    return { success: true, data: healthMonitoring };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get()
  @ApiOperation({
    summary: 'Gets  health readings',
    description:
      'This endpoint is used to get health readings. Accessible to patients only',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async getHealthReadingsByPatient(@Req() req: Request) {
    const patientId = req.user.id;
    const healthMonitoring =
      await this.healthMonitoringService.getHealthReadingsByPatient(patientId);

    return { success: true, data: healthMonitoring };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('latest')
  @ApiOperation({
    summary: 'Gets letest health readings',
    description:
      'This endpoint is used to get the latest health readings. Accessible to patients only',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async getLatestReadingByPatient(@Req() req: Request) {
    const patientId = req.user?.id;
    const healthMonitoring =
      await this.healthMonitoringService.getLatestReadingByPatient(patientId);

    return { success: true, data: healthMonitoring };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiOperation({
    summary: 'Gets a particular health readings',
    description:
      'This endpoint is used to get a particular health readings. Accessible to admins only',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async getHealthReadingById(@Param('id') id: string) {
    const healthMonitoring =
      await this.healthMonitoringService.getHealthReadingById(id);

    return { success: true, data: healthMonitoring };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch(':id')
  @ApiOperation({
    summary: 'Updates a health reading',
    description:
      'This endpoint is used to update a patients health reading.  Accessible to patients only',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async updateHealthReading(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateDto: UpdateHealthReadingDto,
  ) {
    const patientId = req.user?.id;
    const healthMonitoring =
      await this.healthMonitoringService.updateHealthReading(
        id,
        patientId,
        updateDto,
      );

    return { success: true, data: healthMonitoring };
  }

  // @Delete(':id')
  // async deleteHealthReading(@Param('id') id: string, @Req() req: Request) {
  //   const patientId = req.user?.id;
  //   return this.healthMonitoringService.deleteHealthReading(id, patientId);
  // }
}
