import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';


@Controller('speciality')
export class SpecialityController {
  constructor(private readonly specialityService: SpecialityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(
    @Body() createSpecialityDto: CreateSpecialityDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;
    return this.specialityService.create(createSpecialityDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Get()
  findAll() {
    return this.specialityService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Get()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specialityService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSpecialityDto: UpdateSpecialityDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;

    return this.specialityService.update(updateSpecialityDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specialityService.remove(id);
  }
}
