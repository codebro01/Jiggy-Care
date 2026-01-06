import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { OrdersService } from '@src/order/order.service';
import { UpdateOrderDto } from '@src/order/dto/update-order.dto';
import { OrderSelectType } from '@src/db/order';
import type { Request } from '@src/types';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    description: 'The endpoint is for admin to get all orders in the db',
    summary: 'Get all orders by admin',
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
  @Get()
  async findAll() {
    const orders = await this.ordersService.findAll();
    return { success: true, data: orders };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('find-by-userId')
  @ApiOperation({
    description: 'The endpoint is for patient to get their orders',
    summary: 'Get all orders by patients',
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
  async findByUserId(@Req() req: Request) {
    const { id: userId } = req.user;
    const orders = await this.ordersService.findByUserId(userId);
    return { success: true, data: orders };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'patient')
  @ApiOperation({
    description:
      'The endpoint is for admin and patient to find information about a specific order',
    summary: 'find specific order',
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
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderSelectType> {
    return await this.ordersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({
    description: 'The endpoint is for admin to update a specific order',
    summary: 'Update specific order by admin',
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
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderSelectType> {
    return await this.ordersService.update(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post(':id/reorder')
  @ApiOperation({
    description:
      'The endpoint is for patient to re-order a speficic medication',
    summary: 'Reorder medications',
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
  async reorder(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<OrderSelectType> {
    const { id: userId } = req.user;
    return await this.ordersService.reorder(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    description: 'The endpoint is for admin to delete a specific order',
    summary: 'Delete orders',
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
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return await this.ordersService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    description: 'The endpoint is only accessible to admin',
    summary: 'Update order delivery status',
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
  @Patch('update/delivery-status/:orderId')
  async updateOrderDeliveryStatus(@Param() orderId: string){
    const order = await this.ordersService.updateOrderDeliveryStatus(orderId);
    return {
      success: true,
      data: order,
    };
  }
}
