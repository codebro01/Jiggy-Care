import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TestResultRepository } from './repository/test-result.repository';
import { CreateTestResultDto } from '@src/test-result/dto/create-test-result.dto';
import { UpdateTestResultDto } from '@src/test-result/dto/update-test-result.dto';

@Injectable()
export class TestResultService {
  constructor(private readonly testResultRepository: TestResultRepository) {}

  async createTestResult(data: CreateTestResultDto, consultantId: string) {
    const testResult = await this.testResultRepository.createTestResult({
      consultantId,
      labId: data.labId,
      patientId: data.patientId,
      title: data.title,
      date: new Date(data.date),
      testValues: data.testValues as any,
    });

    return testResult;
  }

  async getTestResultById(id: string) {
    const testResult =
      await this.testResultRepository.findTestResultByPatientId(id);

    if (!testResult) {
      throw new NotFoundException('Test result not found');
    }

    return testResult;
  }

  async getTestResultsByConsultant(consultantId: string) {
    const testResults =
      await this.testResultRepository.findTestResultsByConsultant(consultantId);
    return testResults;
  }

  async getTestResultsByLab(labId: string) {
    const testResults =
      await this.testResultRepository.findTestResultsByLab(labId);
    return testResults;
  }

  async getAllTestResults() {
    const testResults = await this.testResultRepository.findAllTestResults();
    return testResults;
  }

  async updateTestResult(
    updateDto: UpdateTestResultDto,
    id: string,
    consultantId: string,
  ) {
    const existingTestResult =
      await this.testResultRepository.findTestResultByPatientId(id);

    if (!existingTestResult) {
      throw new NotFoundException('Test result not found');
    }

    if (existingTestResult.test_results.consultantId !== consultantId) {
      throw new ForbiddenException(
        'You are not authorized to update this test result',
      );
    }

    const updateData: any = {};
    if (updateDto.labId !== undefined) updateData.labId = updateDto.labId;
    if (updateDto.title) updateData.title = updateDto.title;
    if (updateDto.date) updateData.date = new Date(updateDto.date);
    if (updateDto.testValues) updateData.testValues = updateDto.testValues;

    const updatedTestResult = await this.testResultRepository.updateTestResult(
      updateData,
      id,
      consultantId,
    );

    if (!updatedTestResult) {
      throw new NotFoundException(
        'Test result not found or you are not authorized',
      );
    }

    return updatedTestResult;
  }

  async deleteTestResult(id: string, consultantId: string) {
    const existingTestResult =
      await this.testResultRepository.findTestResultByPatientId(id);

    if (!existingTestResult) {
      throw new NotFoundException('Test result not found');
    }

    if (existingTestResult.test_results.consultantId !== consultantId) {
      throw new ForbiddenException(
        'You are not authorized to delete this test result',
      );
    }

    const deletedTestResult = await this.testResultRepository.deleteTestResult(
      id,
      consultantId,
    );

    if (!deletedTestResult) {
      throw new NotFoundException(
        'Test result not found or you are not authorized',
      );
    }

    return {
      message: 'Test result deleted successfully',
      data: deletedTestResult,
    };
  }
}
