import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum OrderStatusType {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class UpdateOrderDto {
  @IsEnum(OrderStatusType)
  @IsOptional()
  status?: OrderStatusType;

  @IsString()
  @IsOptional()
  trackingId?: string;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;
}
