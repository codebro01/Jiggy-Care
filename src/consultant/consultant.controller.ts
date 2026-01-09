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
import {
  ApiBearerAuth,
  ApiHeader,
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { QueryPendingConsultantApprovalDto } from '@src/dashboard/dto/query-consultant-approval.dto';
import { ToggleConsultantApprovalDto } from '@src/consultant/dto/toggle-consultant-approval.dto';

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
  @HttpCode(HttpStatus.OK)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  @ApiOperation({
    summary: 'This endpoint lists all consultant pending approvals',
    description:
      'This endpoint lists all consultant pending approvals. It is only accessible to admins',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async pendingConsultantApprovals(
    @Query() query: QueryPendingConsultantApprovalDto,
  ) {
    const adminDashboard =
      await this.consultantService.pendingConsultantApprovals(query);

    return { success: true, data: adminDashboard };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  @ApiOperation({
    summary: 'This endpoint is used to  approval or disapprove a consultant',
    description:
      'This endpoint can be used to approve or disapprove a consultant. It is only accessible to admins',
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  async toggleConsultantApproval(@Query() query: ToggleConsultantApprovalDto) {
    const toggleConsultantApproval =
      await this.consultantService.toggleConsultantApproval(query);

    return { success: true, data: toggleConsultantApproval };
  }
}
