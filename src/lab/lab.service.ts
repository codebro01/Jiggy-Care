import { Injectable } from '@nestjs/common';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { LabRepository } from '@src/lab/repository/lab.repository';

@Injectable()
export class LabService {
  constructor(private labRepository: LabRepository) {}
  async create(createLabDto: CreateLabDto, userId: string) {
    return await this.labRepository.create(createLabDto, userId);
  }

  async findAll() {
    return await this.labRepository.findAll();
  }

  async findOne(labId: string) {
    return await this.labRepository.findOne(labId);
  }

  async update(updateLabDto: UpdateLabDto, labId: string) {
    return await this.labRepository.update(updateLabDto, labId);
  }

  async remove(labId: string) {
    return await this.labRepository.remove(labId);
  }
}
