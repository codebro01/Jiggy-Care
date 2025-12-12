import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Patch,
  Req
} from '@nestjs/common';
import { TestResultService } from './test-result.service';
import { CreateTestResultDto } from '@src/test-result/dto/create-test-result.dto';
import { UpdateTestResultDto } from '@src/test-result/dto/update-test-result.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';


@Controller('test-results')
export class TestResultController {
  constructor(private readonly testResultService: TestResultService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Post()
  async createTestResult(
    @Body() createDto: CreateTestResultDto,
    @Req() req: Request,
  ) {
    const { id: consultantId } = req.user;
    return this.testResultService.createTestResult(createDto, consultantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getAllTestResults() {
    return this.testResultService.getAllTestResults();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Get('consultant/:consultantId')
  async getTestResultsByConsultant(@Req() req: Request) {
    const { id: consultantId } = req.user;

    return this.testResultService.getTestResultsByConsultant(consultantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('lab/:labId')
  async getTestResultsByLab(@Param('labId') labId: string) {
    return this.testResultService.getTestResultsByLab(labId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get(':id')
  async getTestResultByPatientId(@Req() req: Request) {
        const { id: patientId } = req.user;

    return this.testResultService.getTestResultById(patientId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async updateTestResult(
    @Param('id') testResultId: string,
    @Req() req: Request, 
    @Body() updateDto: UpdateTestResultDto,
  ) {
    const consultantId = req.user?.id
    return this.testResultService.updateTestResult(updateDto, testResultId, consultantId);
  }
}
