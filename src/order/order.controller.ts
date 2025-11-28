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
  Res,
} from '@nestjs/common';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { OrdersService } from '@src/order/order.service';
import { UpdateOrderDto } from '@src/order/dto/update-order.dto';
import { OrderSelectType } from '@src/db/order';
import type { Request } from '@src/types';
import type { Response } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Res() res: Response) {
    const orders = await this.ordersService.findAll();
    res.status(HttpStatus.OK).json({ message: 'success', data: orders });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('find-by-userId')
  async findByUserId(@Res() res: Response, @Req() req: Request) {
    const { id: userId } = req.user;
    const orders = await this.ordersService.findByUserId(userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: orders });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderSelectType> {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderSelectType> {
    return await this.ordersService.update(id, updateOrderDto);
  }

  @Post(':id/reorder')
  async reorder(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<OrderSelectType> {
    return await this.ordersService.reorder(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return await this.ordersService.delete(id);
  }
}
