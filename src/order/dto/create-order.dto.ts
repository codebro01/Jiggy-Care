import {
  IsNotEmpty,
  IsString,
 IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';


export type MedicationPayloadType = {
  medicationId: string, 
  quantity: number, 
}


export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Pass in the id of the medications here',
    example: [
      '06f9a413-d1bc-4641-a0e3-ae59c8e56c9c',
      '06f9a413-d1bc-4641-a0e3-ae59c8e56dfd',
    ],
    type: String,
  })
  @IsArray()
  @IsNotEmpty()
  medicationPayload: MedicationPayloadType[];

  @ApiPropertyOptional({
    description: 'Address where item will be delivered',
    example: 'No 6 beside AA Rano filling station, Egbeda, Lagos State',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;
}
