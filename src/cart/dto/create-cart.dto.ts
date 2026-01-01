import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @ApiProperty({
    description: 'The UUID of the medication',
    example: 'bcdf979b-7627-4555-b17d-2fbf1c209622',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  medicationId: string;

  @ApiProperty({
    description: 'The quantity of the medication',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class CreateCartDto {
  @ApiProperty({
    description: 'Array of cart items containing medication IDs and quantities',
    type: [CartItemDto],
    example: [
      {
        medicationId: 'bcdf979b-7627-4555-b17d-2fbf1c209622',
        quantity: 2,
      },
      {
        medicationId: '2f9d6204-16bb-401b-b72e-e51416c937b6',
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsNotEmpty()
  items: CartItemDto[];
}
