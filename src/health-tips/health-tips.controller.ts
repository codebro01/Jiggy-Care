import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthTipsService } from './health-tips.service';
import { CreateHealthTipDto } from './dto/create-health-tip.dto';
import { UpdateHealthTipDto } from './dto/update-health-tip.dto';

@Controller('health-tips')
export class HealthTipsController {
  constructor(private readonly healthTipsService: HealthTipsService) {}

  @Post()
  create(@Body() createHealthTipDto: CreateHealthTipDto) {
    return this.healthTipsService.create(createHealthTipDto);
  }

  @Get()
  findAll() {
    return this.healthTipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthTipsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthTipDto: UpdateHealthTipDto) {
    return this.healthTipsService.update(+id, updateHealthTipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthTipsService.remove(+id);
  }
}
