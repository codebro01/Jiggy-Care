import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum specialityPrefixOptions {
  DR = 'Dr.',
  PHARM = 'Pharm.',
  MLS = 'MLS',
  PHYSIO = 'Physio',
  RAD = 'Rad.',
  OPTOM = 'Optom.',
  DIET = 'Diet.',
  NUT = 'Nut.', 
  PSYCH = 'Psych.', 
  COUNSELLOR = 'Counsellor', 
}

// DTO for creating a new speciality
export class CreateSpecialityDto {
  @ApiProperty({
    description: 'Name of the speciality',
    example: 'Pharmacist',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;


  @ApiProperty({
    description: 'The prefix of the speciality',
    example: 'Pharm.',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsEnum(specialityPrefixOptions)
  prefix: specialityPrefixOptions;

  @ApiPropertyOptional({
    description: 'Detailed description of the speciality',
    example: ' A medication specialist who prepares and distributes prescription drugs.',
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
