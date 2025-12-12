import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { readingStatusType } from '@src/db/health-monitoring';

class TemperatureDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @IsString()
  @IsOptional()
  note?: string;
}

class HeartRateDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @IsString()
  @IsOptional()
  note?: string;
}

class WeightDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @IsString()
  @IsOptional()
  note?: string;
}

class BloodPressureDto {
  @IsNumber()
  @IsNotEmpty()
  systolic: number;

  @IsNumber()
  @IsNotEmpty()
  diastolic: number;

  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateHealthReadingDto {
  @ValidateNested()
  @Type(() => TemperatureDto)
  @IsOptional()
  temperature?: TemperatureDto;

  @ValidateNested()
  @Type(() => HeartRateDto)
  @IsOptional()
  heartRate?: HeartRateDto;

  @ValidateNested()
  @Type(() => WeightDto)
  @IsOptional()
  weight?: WeightDto;

  @ValidateNested()
  @Type(() => BloodPressureDto)
  @IsOptional()
  bloodPressure?: BloodPressureDto;
}
