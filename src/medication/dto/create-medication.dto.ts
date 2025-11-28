import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock',
}

export class CreateMedicationDto {
  @ApiProperty({
    description: 'Name of the medication',
    example: 'Acetaminophen',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Gram of the medication',
    example: 500,
  })
  @IsNumber()
  @IsNotEmpty()
  gram: number;

  @ApiProperty({
    description: 'Description of the medication',
    example: 'Pain reliever and fever reducer',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Price of the medication in local currency and should be in kobo, the example below represents 5,200 naira',
    example: 520000,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Rating of the medication',
    example: 4.6,
    required: false,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'Stock status of the medication',
    enum: StockStatus,
    example: StockStatus.IN_STOCK,
    required: false,
  })
  @IsOptional()
  @IsEnum(StockStatus)
  stockStatus?: StockStatus;

  @ApiProperty({
    description: 'Available quantity in stock',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({
    description: 'Category of the medication',
    example: 'Pain Relief',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;
}
