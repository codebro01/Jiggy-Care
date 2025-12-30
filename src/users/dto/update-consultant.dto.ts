import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Nested class for Working Hours documentation
class WorkingHoursDto {
  @ApiPropertyOptional({ example: '09:00-17:00' })
  @IsOptional()
  @IsString()
  monday?: string;
  @ApiPropertyOptional({ example: '09:00-17:00' })
  @IsOptional()
  @IsString()
  tuesday?: string;
  @ApiPropertyOptional({ example: '09:00-17:00' })
  @IsOptional()
  @IsString()
  wednesday?: string;
  @ApiPropertyOptional({ example: '09:00-17:00' })
  @IsOptional()
  @IsString()
  thursday?: string;
  @ApiPropertyOptional({ example: '09:00-17:00' })
  @IsOptional()
  @IsString()
  friday?: string;
  @ApiPropertyOptional({ example: '10:00-14:00' })
  @IsOptional()
  @IsString()
  saturday?: string;
  @ApiPropertyOptional({ example: 'Closed' })
  @IsOptional()
  @IsString()
  sunday?: string;
}

export class UpdateConsultantDto {
  @ApiPropertyOptional({
    description: 'Is the consultant currently taking appointments?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  availability?: boolean;

  @ApiPropertyOptional({
    description: 'Area of expertise',
    maxLength: 50,
    example: 'Cardiology',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  speciality?: string;

  @ApiPropertyOptional({
    description: 'Total years of professional experience',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  yrsOfExperience?: number;

  @ApiPropertyOptional({ description: 'Biography or professional summary' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({
    description: 'List of languages spoken',
    example: ['English', 'Spanish'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({
    description: 'Academic background',
    example: ['MD from Harvard'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  @ApiPropertyOptional({
    description: 'Professional certifications',
    example: ['Board Certified Surgeon'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certification?: string[];

  @ApiPropertyOptional({
    example: 'No 54 walkway street, Lagos',
    description: 'The address of the patient',
  })
  @IsString()
  @IsOptional()
  address?: string | null;

  @ApiPropertyOptional({
    type: WorkingHoursDto,
    description: 'Weekly availability schedule',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;
}
