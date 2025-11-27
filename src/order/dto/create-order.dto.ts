import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  medicationId: string;

  @IsString()
  @IsNotEmpty()
  medicationName: string;

  @IsNumber()
  @Min(1)
  gram: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
 

  @ApiPropertyOptional({
    description: 'Array of items that was added to cart',
    example: '[]',
    type: String,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'Address where item will be delivered',
    example: 'No 6 beside AA Rano filling station, Egbeda, Lagos State',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after payment',
    example: 'https://yourapp.com/payment/callback',
    type: String,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Callback URL must be a valid URL' })
  callback_url?: string;
}
