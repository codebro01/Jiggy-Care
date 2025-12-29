import { Injectable } from '@nestjs/common';
import { CreateHealthTipDto } from './dto/create-health-tip.dto';
import { UpdateHealthTipDto } from './dto/update-health-tip.dto';
import { healthTipsTableSelectType } from '@src/db';
import { HealthTipsRepository } from '@src/health-tips/repository/health-tips.repository';

@Injectable()
export class HealthTipsService {
  constructor(private readonly healthTipsRepository: HealthTipsRepository) {}

  async createHealthTips(
    data: CreateHealthTipDto, userId: string
  ): Promise<healthTipsTableSelectType> {
    const healthTip: healthTipsTableSelectType =
      await this.healthTipsRepository.createHealthTip(data, userId);
    return healthTip;
  }

  async findAll(): Promise<healthTipsTableSelectType[]> {
    const healthTips: healthTipsTableSelectType[] =
      await this.healthTipsRepository.getHealthTips();
    return healthTips;
  }

  async update(
    data: UpdateHealthTipDto,
    id: string,
  ): Promise<healthTipsTableSelectType> {
    const healthTip: healthTipsTableSelectType =
      await this.healthTipsRepository.updateHealthTip(data, id);
    return healthTip;
  }
}
