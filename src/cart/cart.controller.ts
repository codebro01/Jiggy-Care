import { Controller, Get, Body, Patch, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import {
  ApiOperation,
  ApiHeader,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import type { Request } from '@src/types';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch()
  @ApiOperation({
    summary:
      'This endpoints creates or updates patients medication cart depending on whether it exists or not',
    description:
      'create or update patients cart. This endpoint is only accessible to patients',
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
  async update(@Body() data: CreateCartDto, @Req() req: Request) {
    const { id: patientId } = req.user;
    const cart = await this.cartService.update(data, patientId);
    return { success: true, data: cart };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get()
  @ApiOperation({
    summary:
      'This endpoint finds a stored user cart, i.e for a logged in patient',
    description:
      'Find patient cart. This enpoint is only accessible to patients',
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
  async findOne(@Req() req: Request) {
    const { id: patientId } = req.user;
    const cart = await this.cartService.findOne(patientId);

    return { success: true, data: cart };
  }
}
