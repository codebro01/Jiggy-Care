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
import { UpdateTestDto } from '@src/test/dto/update-test.dto';
import { CreateTestDto } from '@src/test/dto/create-test.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { TestService } from '@src/test/test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(
    @Body()data:CreateTestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const test = await this.testService.create(data, userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: test });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'patient', 'consultant')
  @Get()
  async findAll(@Res() res: Response) {
    const test = await this.testService.findAll();
    res.status(HttpStatus.OK).json({ message: 'success', data: test });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Get(':id')
  async findOne(@Param('id') testId: string, @Res() res: Response) {
    const test = await this.testService.findOne(testId);
    res.status(HttpStatus.OK).json({ message: 'success', data: test });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Patch(':id')
  async update(
    @Param('id') testId: string,
    @Body() data: UpdateTestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const test = await this.testService.update(data, testId);
    res.status(HttpStatus.OK).json({ message: 'success', data: test });
  }

}
