import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryPatientsDto } from '@src/patient/dto/query-patients.dto';
import { PatientService } from '@src/patient/patient.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('list')
  @ApiOperation({
    summary: 'This endpoint lists all patients',
    description:
      'This endpoints list patients. It is only accessible to admins',
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
  async listAllPatients(@Query() query: QueryPatientsDto) {
    const patients = await this.patientService.listAllPatients(query);

    return { success: true, data: patients };
  }
}
