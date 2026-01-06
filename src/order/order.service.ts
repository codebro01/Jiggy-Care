import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderType, OrdersRepository } from '@src/order/repository/order.repository';
import { OrderSelectType } from '@src/db/order';


@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}


  async findAll(): Promise<OrderSelectType[]> {
    const orders = await this.ordersRepository.findAll();
    return orders;;
  }

  async findByUserId(userId: string): Promise<OrderSelectType[]> {
    const orders = await this.ordersRepository.findByUserId(userId);
    return orders;;
  }

  async findOne(id: string): Promise<OrderSelectType> {
    const order = await this.ordersRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderSelectType> {
    const order = await this.ordersRepository.update(id, updateOrderDto);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async reorder(orderId: string, patientId: string): Promise<OrderSelectType> {
    const originalOrder = await this.ordersRepository.findOne(orderId);
    if (!originalOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const data: Pick<CreateOrderType, "items" | "deliveryAddress"> & { patientId: string } = {
      patientId,
      items: originalOrder.items as any,
      deliveryAddress: originalOrder.deliveryAddress,
    };

    return await this.ordersRepository.savePayment(
      { ...originalOrder, ...data, amount: originalOrder.totalAmount},
      patientId,
    );    
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.ordersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  async updateOrderDeliveryStatus(orderId: string) {
    const isExisting = await this.ordersRepository.findOne(orderId);
    if(!isExisting) throw new NotFoundException('Order not found')
    const order = await this.ordersRepository.updateOrderDeliveryStatus(orderId);

    return order
  }

}
