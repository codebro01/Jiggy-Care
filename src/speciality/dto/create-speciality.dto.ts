import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for creating a new speciality
export class CreateSpecialityDto {
  @ApiProperty({
    description: 'Name of the speciality',
    example: 'Cardiology',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the speciality',
    example: 'Specialized in heart and cardiovascular system treatment',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price for the speciality service',
    example: 150.0,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;
}
