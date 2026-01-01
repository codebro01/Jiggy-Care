import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type MedicationPayloadType = {
  medicationId: string;
  quantity: number;
};

export class CreateOrderDto {
  @ApiProperty({
    description: 'The cart id of the cart of the user',
    example: '60f2cc4e-3002-44bc-89ea-f91c419ebab4',
  })
  @IsNotEmpty()
  @IsUUID()
  cartId: string;

  @ApiPropertyOptional({
    description: 'Address where item will be delivered',
    example: 'No 6 beside AA Rano filling station, Egbeda, Lagos State',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;
}
