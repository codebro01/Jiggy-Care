import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { readingStatusType } from '@src/db/health-monitoring';

class TemperatureDto {
  @ApiProperty({
    description: 'Temperature value in Celsius',
    example: 37.2,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Status of the temperature reading',
    enum: ['normal', 'high', 'low', 'critical'],
    example: 'normal',
    required: false,
  })
  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @ApiProperty({
    description: 'Additional notes about the temperature reading',
    example: 'Patient felt warm but no other symptoms',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}

class HeartRateDto {
  @ApiProperty({
    description: 'Heart rate in beats per minute (bpm)',
    example: 72,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Status of the heart rate reading',
    enum: ['normal', 'high', 'low', 'critical'],
    example: 'normal',
    required: false,
  })
  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @ApiProperty({
    description: 'Additional notes about the heart rate reading',
    example: 'Measured after 5 minutes rest',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}

class WeightDto {
  @ApiProperty({
    description: 'Weight in kilograms',
    example: 70.5,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Status of the weight reading',
    enum: ['normal', 'high', 'low', 'critical'],
    example: 'normal',
    required: false,
  })
  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @ApiProperty({
    description: 'Additional notes about the weight reading',
    example: 'Measured in the morning before breakfast',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}

class BloodPressureDto {
  @ApiProperty({
    description: 'Systolic blood pressure in mmHg',
    example: 120,
  })
  @IsNumber()
  @IsNotEmpty()
  systolic: number;

  @ApiProperty({
    description: 'Diastolic blood pressure in mmHg',
    example: 80,
  })
  @IsNumber()
  @IsNotEmpty()
  diastolic: number;

  @ApiProperty({
    description: 'Status of the blood pressure reading',
    enum: ['normal', 'high', 'low', 'critical'],
    example: 'normal',
    required: false,
  })
  @IsEnum(readingStatusType)
  @IsOptional()
  status?: readingStatusType;

  @ApiProperty({
    description: 'Additional notes about the blood pressure reading',
    example: 'Patient was seated and relaxed',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'The date of the observation of the blood pressure',
    example: '2025-05-12T05:33:00',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class CreateHealthReadingDto {
  @ApiProperty({
    description: 'Temperature reading',
    type: TemperatureDto,
    required: false,
    example: {
      value: 37.2,
      status: 'normal',
      note: 'Patient felt warm but no other symptoms',
    },
  })
  @ValidateNested()
  @Type(() => TemperatureDto)
  @IsOptional()
  temperature?: TemperatureDto;

  @ApiProperty({
    description: 'Heart rate reading',
    type: HeartRateDto,
    required: false,
    example: {
      value: 72,
      status: 'normal',
      note: 'Measured after 5 minutes rest',
    },
  })
  @ValidateNested()
  @Type(() => HeartRateDto)
  @IsOptional()
  heartRate?: HeartRateDto;

  @ApiProperty({
    description: 'Weight reading',
    type: WeightDto,
    required: false,
    example: {
      value: 70.5,
      status: 'normal',
      note: 'Measured in the morning before breakfast',
    },
  })
  @ValidateNested()
  @Type(() => WeightDto)
  @IsOptional()
  weight?: WeightDto;

  @ApiProperty({
    description: 'Blood pressure reading',
    type: BloodPressureDto,
    required: false,
    example: {
      systolic: 120,
      diastolic: 80,
      status: 'normal',
      note: 'Patient was seated and relaxed',
      date: "2025-05-12T05:33:00"
    },
  })
  @ValidateNested()
  @Type(() => BloodPressureDto)
  @IsOptional()
  bloodPressure?: BloodPressureDto;
}
