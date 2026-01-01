import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  Delete,
  Post,
} from '@nestjs/common';
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
import {
  UpdateCartItemQuantityDto,
  AddCartItemDto,
} from '@src/cart/dto/cart-item-operations.dto';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Patch(':medicationId')
  @ApiOperation({
    summary:
      'This endpoint updates cart quantity for specific items for patients',
    description:
      'Update quantity of the cart item. This endpoint is only accessible to patients',
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
  async updateItemQuantity(
    @Param('medicationId') medicationId: string,
    @Body() dto: UpdateCartItemQuantityDto,
    @Req() req: Request,
  ) {
    const { id: patientId } = req.user;
    return this.cartService.updateItemQuantity(
      patientId,
      medicationId,
      dto.quantity,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post('items')
  @ApiOperation({
    summary:
      'This endpoint adds item to patients cart i.e for a logged in patient',
    description:
      'Add items to cart. This enpoint is only accessible to patients',
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
  async addItem(@Body() dto: AddCartItemDto, @Req() req: Request) {
    const { id: patientId } = req.user;
    return this.cartService.addItem(patientId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Delete('items/:medicationId')
  @ApiOperation({
    summary:
      'This endpoint removes a specific item from cart, i.e for a logged in patient',
    description:
      'Remove item from cart. This enpoint is only accessible to patients',
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
  async removeItem(
    @Req() req: Request,
    @Param('medicationId') medicationId: string,
  ) {
    const { id: patientId } = req.user;
    return this.cartService.removeItem(patientId, medicationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Delete()
  @ApiOperation({
    summary: 'This endpoint clears the cart, i.e for a logged in patient',
    description:
      'Clear cart items. This enpoint is only accessible to patients',
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
  async clearCart(@Req() req: Request) {
    const { id: patientId } = req.user;
    const cart = await this.cartService.clearCart(patientId);

    return { success: true, message: cart, data: [] };
  }
}
