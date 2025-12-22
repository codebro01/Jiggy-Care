import {
  Controller,
  UseGuards,
  HttpStatus,
  Get,
  HttpCode,
  Query,
} from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';

import { ConsultantService } from './consultant.service';
import { SearchConsultantDto } from '@src/consultant/dto/search-consultant.dto';
import { ApiBearerAuth, ApiHeader, ApiCookieAuth } from '@nestjs/swagger';

@Controller('consultant')
export class ConsultantController {
  constructor(private readonly consultantService: ConsultantService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'patient')
  @Get('search-consultant')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  async findConsultantByNameOrSpeciality(@Query() search: SearchConsultantDto) {
    // const { id: userId } = req.user;

    const consultant =
      await this.consultantService.findConsultantByNameOrSpeciality(
        search.query,
      );

    return { success: true, data: consultant };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'patient')
  @Get('list')
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async listAllApprovedConsultants() {
    // const { id: userId } = req.user;

    const consultants =
      await this.consultantService.listAllApprovedConsultants();

    return { success: true, data: consultants };
  }
}
