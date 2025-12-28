import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TestResultService } from './test-result.service';
import { CreateTestResultDto } from '@src/test-result/dto/create-test-result.dto';
import { UpdateTestResultDto } from '@src/test-result/dto/update-test-result.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';
import { ApiCookieAuth, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';

@Controller('test-results')
export class TestResultController {
  constructor(private readonly testResultService: TestResultService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Post()
  @ApiOperation({
    summary: 'Create a test result',
    description:
      'This endpoint creates a test result, accessible only to consultants',
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
  @HttpCode(HttpStatus.CREATED)
  async createTestResult(
    @Body() createDto: CreateTestResultDto,
    @Req() req: Request,
  ) {
    const { id: consultantId } = req.user;
    const testResult = await this.testResultService.createTestResult(
      createDto,
      consultantId,
    );
    return { success: true, data: testResult };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({
    summary: 'Get all patients test results',
    description:
      'This endpoint gets all the test result that has ever taken place, accessible only to admins',
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
  @HttpCode(HttpStatus.OK)
  async getAllTestResults() {
    const testResults = await this.testResultService.getAllTestResults();
    return { success: true, data: testResults };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Get('consultant/:consultantId')
  @ApiOperation({
    summary: 'Get all patients lab test results by consultants',
    description:
      'This endpoint gets all the test result a consultant has ever created for patients, accessible only to consultants',
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
  @HttpCode(HttpStatus.OK)
  async getTestResultsByConsultant(@Req() req: Request) {
    const { id: consultantId } = req.user;

    const testResults =
      await this.testResultService.getTestResultsByConsultant(consultantId);
    return { success: true, data: testResults };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('lab/:labId')
  @ApiOperation({
    summary: 'Get all patients lab test results by lab',
    description:
      'This endpoint gets all the test result that is tied to a particular lab. Endpoint is accessible only to admins',
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
  @HttpCode(HttpStatus.OK)
  async getTestResultsByLab(@Param('labId') labId: string) {
    const testResults = await this.testResultService.getTestResultsByLab(labId);
    return { success: true, data: testResults };
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('patient')
  // @Get()
  // @ApiHeader({
  //   name: 'x-client-type',
  //   description:
  //     'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
  //   required: false,
  //   schema: {
  //     type: 'string',
  //     enum: ['mobile', 'web'],
  //     example: 'mobile',
  //   },
  // })
  // @ApiBearerAuth('JWT-auth')
  // @ApiCookieAuth('access_token')
  // @HttpCode(HttpStatus.OK)
  // async getTestResulByPatientId(@Req() req: Request) {
  //   const { id: patientId } = req.user;

  //   const testResult =
  //     await this.testResultService.getTestResultById(patientId);
  //   return { success: true, data: testResult };
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('/patient')
  @ApiOperation({
    summary: 'Get all patients lab test results by patients',
    description:
      'This endpoint gets all the test result that has been uploaded for a particular patient. This enpoint is accessible only to patients',
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
  @HttpCode(HttpStatus.OK)
  async getTestResultByPatientId(@Req() req: Request) {
    const { id: patientId } = req.user;

    const testResult =
      await this.testResultService.getAllTestResultsByPatientId(patientId);
    return { success: true, data: testResult };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update test results',
    description: 'This endpoint is used to update test results. Accessible only by admins',
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
  @HttpCode(HttpStatus.OK)
  async updateTestResult(
    @Param('id') testResultId: string,
    @Req() req: Request,
    @Body() updateDto: UpdateTestResultDto,
  ) {
    const consultantId = req.user?.id;
    const testResult = await this.testResultService.updateTestResult(
      updateDto,
      testResultId,
      consultantId,
    );

    return { success: true, data: testResult };
  }
}
