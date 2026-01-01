import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import {
  OrderStatusType,
  UpdateOrderDto,
} from '@src/order/dto/update-order.dto';
import { CreateOrderDto } from '@src/order/dto/create-order.dto';
import { OrderSelectType } from '@src/db/order';
import { orderTable } from '@src/db/order';


export type OrderItemType = {
  medicationId: string, 
  medicationName: string, 
    gram: number, 
    quantity: number, 
    price: number, 
}
export interface CreateOrderType extends CreateOrderDto {
  reference: string;
  orderId: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionType: string;
  items: OrderItemType[];
  amount: number, 
}

@Injectable()
export class OrdersRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async savePayment(
    data: CreateOrderType,
    patientId: string,
    trx?: any,
  ): Promise<OrderSelectType> {
    // Calculate total amount

    const Trx = trx || this.DbProvider;
   

    // Generate order number
    const [order] = await Trx.insert(orderTable)
      .values({
        orderId: data.orderId,
        userId: patientId,
        items: data.items,
        totalAmount: data.amount,
        deliveryAddress: data.deliveryAddress,
        status: 'pending',
        paymentMethod: data.paymentMethod, 
        transactionType: 'purchase', 
        paymentStatus: 'paid', 
        reference: data.reference, 
        cartId: data.cartId, 

      })
      .returning();

    return order;
  }

  async findByReference(reference: string) {
    const [payment] = await this.DbProvider.select()
      .from(orderTable)
      .where(eq(orderTable.reference, reference))
      .limit(1);

    return payment;
  }

  async findAll(): Promise<OrderSelectType[]> {
    return await this.DbProvider.select()
      .from(orderTable)
      .orderBy(desc(orderTable.orderDate));
  }

  async findByUserId(userId: string): Promise<OrderSelectType[]> {
    return await this.DbProvider.select()
      .from(orderTable)
      .where(eq(orderTable.userId, userId))
      .orderBy(desc(orderTable.orderDate));
  }

  async findOne(id: string): Promise<OrderSelectType | undefined> {
    const [order] = await this.DbProvider.select()
      .from(orderTable)
      .where(eq(orderTable.id, id));

    return order;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderSelectType | undefined> {
    const updateData: any = {
      ...updateOrderDto,
      updatedAt: new Date(),
    };

    // If status is being updated to delivered, set delivery date
    if (updateOrderDto.status === OrderStatusType.DELIVERED) {
      updateData.deliveryDate = new Date();
    }

    const [updatedOrder] = await this.DbProvider.update(orderTable)
      .set(updateData)
      .where(eq(orderTable.id, id))
      .returning();

    return updatedOrder;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.DbProvider.delete(orderTable)
      .where(eq(orderTable.id, id))
      .returning();

    return result.length > 0;
  }
}
