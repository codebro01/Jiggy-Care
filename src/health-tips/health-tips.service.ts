import { Injectable } from '@nestjs/common';
import { CreateHealthTipDto } from './dto/create-health-tip.dto';
import { UpdateHealthTipDto } from './dto/update-health-tip.dto';

@Injectable()
export class HealthTipsService {
  create(createHealthTipDto: CreateHealthTipDto) {
    return 'This action adds a new healthTip';
  }

  findAll() {
    return `This action returns all healthTips`;
  }

  findOne(id: number) {
    return `This action returns a #${id} healthTip`;
  }

  update(id: number, updateHealthTipDto: UpdateHealthTipDto) {
    return `This action updates a #${id} healthTip`;
  }

  remove(id: number) {
    return `This action removes a #${id} healthTip`;
  }
}
