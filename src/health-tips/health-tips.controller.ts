import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HealthTipsService } from './health-tips.service';
import { CreateHealthTipDto } from './dto/create-health-tip.dto';
import { UpdateHealthTipDto } from './dto/update-health-tip.dto';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import {
  ApiOperation,
  ApiHeader,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from '@src/types';

@Controller('health-tips')
export class HealthTipsController {
  constructor(private readonly healthTipsService: HealthTipsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({
    summary: 'Creates health tips',
    description:
      'This  endpoint is used to create health tips, accessible only by admins',
  })
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async create(@Body() data: CreateHealthTipDto, @Req() req: Request) {
    const { id: userId } = req.user;
    const healthTips = await this.healthTipsService.createHealthTips(
      data,
      userId,
    );
    return { success: true, data: healthTips };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'admin')
  @Post()
  @ApiOperation({
    summary: 'Gets all health tips meant for patients',
    description:
      'This  endpoint is used to get health tips, accessible by patients and admins',
  })
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async findAll() {
    const healthTips = await this.healthTipsService.findAll();
    return { success: true, data: healthTips };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient', 'admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'update health tips',
    description:
      'This  endpoint is used to get health tips. Accessible by admins',
  })
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateHealthTipDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;

    const healthTips = await this.healthTipsService.update(data, userId);

    return { success: true, data: healthTips };
  }
}
