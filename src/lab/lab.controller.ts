import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { LabService } from '@src/lab/lab.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';
import type { Response } from 'express';

@Controller('lab')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(
    @Body() createLabDto: CreateLabDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const lab = await this.labService.create(createLabDto, userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: lab });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'patient', 'consultant')
  @Get()
  async findAll(@Res() res: Response) {
    const lab = await this.labService.findAll();
    res.status(HttpStatus.OK).json({ message: 'success', data: lab });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Get(':id')
  async findOne(@Param('id') labId: string, @Res() res: Response) {
    const lab = await this.labService.findOne(labId);
    res.status(HttpStatus.OK).json({ message: 'success', data: lab });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Patch(':id')
  async update(
    @Param('id') labId: string,
    @Body() updateLabDto: UpdateLabDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const lab = await this.labService.update(updateLabDto, labId);
    res.status(HttpStatus.OK).json({ message: 'success', data: lab });
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.labService.remove(+id);
  // }
}
