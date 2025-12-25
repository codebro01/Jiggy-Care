import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiHeader,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { MedicationService } from './medication.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MedicationResponseDto } from './dto/response-medication.dto';
import { QueryMedicationDto } from './dto/query-medication.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';

@ApiTags('Medications')
@Controller('medication')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  @ApiOperation({ summary: 'Create a new medication' })
  @ApiResponse({
    status: 201,
    description: 'Medication successfully created',
    type: MedicationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createMedicationDto: CreateMedicationDto) {
    return await this.medicationService.create(createMedicationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Get('find-all')
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
  @ApiOperation({
    summary: 'Get all medications with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of medications retrieved successfully',
    type: [MedicationResponseDto],
  })
  async findAll(@Query() query: QueryMedicationDto) {
    return await this.medicationService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Get('find-one/:id')
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
  @ApiOperation({ summary: 'Get a medication by ID' })
  @ApiParam({ name: 'id', description: 'Medication ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Medication found',
    type: MedicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async findOne(@Param('id') id: string) {
    return await this.medicationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('update/:id')
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
  @ApiOperation({ summary: 'Update a medication' })
  @ApiParam({ name: 'id', description: 'Medication ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Medication successfully updated',
    type: MedicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return await this.medicationService.update(id, updateMedicationDto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a medication' })
  @ApiParam({ name: 'id', description: 'Medication ID', type: String })
  @ApiResponse({ status: 204, description: 'Medication successfully deleted' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async remove(@Param('id') id: string) {
    await this.medicationService.remove(id);
  }
}
