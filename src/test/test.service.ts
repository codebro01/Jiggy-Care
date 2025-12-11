import { Injectable } from '@nestjs/common';
import { CreateTestDto } from '@src/test/dto/create-test.dto';
import { UpdateTestDto } from '@src/test/dto/update-test.dto';
import { TestRepository } from '@src/test/repository/test.repository';

@Injectable()
export class TestService {
  constructor(private testRepository: TestRepository) {}
  async create(data: CreateTestDto, userId: string) {
    return await this.testRepository.create(data, userId);
  }

  async findAll() {
    return await this.testRepository.findAll();
  }

  async findOne(testId: string) {
    return await this.testRepository.findOne(testId);
  }

  async update(data: UpdateTestDto, testId: string) {
    return await this.testRepository.update(data, testId);
  }

  // async remove(id: number) {
  //   return await this.remove(id);
  // }
}
