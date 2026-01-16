import { ApiProperty } from '@nestjs/swagger';
import {
    IsUUID,
    IsNumber,
    IsString,
    IsNotEmpty,
    Min,
    Max,
    MinLength,
    MaxLength,
} from 'class-validator';


export class CreateRatingDto {
  @ApiProperty({
    description: 'UUID of the consultant being rated',
    example: '02b7b3df-9ba3-4cd3-805f-1d0487e2fba1',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  consultantId: string;

  @ApiProperty({
    description: 'Rating value between 1 and 5',
    example: 4.5,
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: 'Review message or feedback',
    example: 'Excellent service! Very professional and helpful.',
    minLength: 10,
    maxLength: 1000,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Message must not exceed 1000 characters' })
  message: string;
}