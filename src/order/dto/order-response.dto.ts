import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  trackingId?: string;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;
}
