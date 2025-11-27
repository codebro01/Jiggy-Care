import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';


export class MedicationResponseDto {
  @ApiProperty({
    description: 'Name of the medication',
    example: 'Acetaminophen',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Gram of the medication',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  gram?: number;

  @ApiProperty({
    description: 'Description of the medication',
    example: 'Pain reliever and fever reducer',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price of the medication',
    example: '5200.00',
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Rating of the medication',
    example: '4.6',
  })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({
    description: 'Stock status',
    example: 'in_stock',
  })
  @IsOptional()
  @IsString()
  stockStatus?: string;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @ApiProperty({
    description: 'Category',
    example: 'Pain Relief',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  category?: string | null;
}
