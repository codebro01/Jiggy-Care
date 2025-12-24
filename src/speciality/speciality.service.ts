import { Injectable } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { SpecialityRepository } from '@src/speciality/repository/speciality.repository';

@Injectable()
export class SpecialityService {
  constructor(private readonly specialityRepository: SpecialityRepository) {}
  async create(data: CreateSpecialityDto, userId: string) {
    return await this.specialityRepository.create(data, userId);
  }

  async findAll() {
    return await this.specialityRepository.findAll();
  }

  async findOne(specialityId: string) {
    return await this.specialityRepository.findOne(specialityId);
  }

  async update(data: UpdateSpecialityDto, specialityId: string) {
    return await this.specialityRepository.update(data, specialityId);
  }

  async remove(specialityId: string) {
    return this.specialityRepository.remove(specialityId)
  }
}
