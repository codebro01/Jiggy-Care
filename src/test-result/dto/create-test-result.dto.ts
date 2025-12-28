import {
  IsString,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { readingStatusType } from '@src/db/health-monitoring';

class TestValueDto {
  @ApiProperty({
    description: 'The measured value of the test',
    example: 14.5,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Normal range for this test',
    example: '12.0-16.0 g/dL',
  })
  @IsString()
  @IsNotEmpty()
  range: string;

  @ApiProperty({
    description: 'Status of the test result',
    enum: ['normal', 'high', 'low', 'critical'],
    example: 'normal',
  })
  @IsEnum(['normal', 'high', 'low', 'critical'])
  @IsNotEmpty()
  status: readingStatusType;
}

class TestValuesDto {
  @ApiProperty({
    description: 'Hemoglobin test results',
    type: TestValueDto,
    required: false,
    example: {
      value: 14.5,
      range: '12.0-16.0 g/dL',
      status: 'normal',
    },
  })
  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  hemoglobin?: TestValueDto;

  @ApiProperty({
    description: 'Hematocrit test results',
    type: TestValueDto,
    required: false,
    example: {
      value: 42,
      range: '36-48%',
      status: 'normal',
    },
  })
  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  hematrocit?: TestValueDto;

  @ApiProperty({
    description: 'White blood cell count',
    type: TestValueDto,
    required: false,
    example: {
      value: 7500,
      range: '4000-11000 cells/μL',
      status: 'normal',
    },
  })
  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  white_blood_cells?: TestValueDto;

  @ApiProperty({
    description: 'Platelet count',
    type: TestValueDto,
    required: false,
    example: {
      value: 250000,
      range: '150000-400000/μL',
      status: 'normal',
    },
  })
  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  platelets?: TestValueDto;
}

export class CreateTestResultDto {
  @ApiProperty({
    description: 'UUID of the lab that conducted the test',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  labId?: string;

  @ApiProperty({
    description: 'UUID of the patient',
    example: '987fcdeb-51a2-43f7-9c8d-123456789abc',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  patientId: string;

  @ApiProperty({
    description: 'Title of the test',
    example: 'Complete Blood Count (CBC)',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Date the test was conducted',
    example: '2024-12-29T10:30:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Test values and results',
    type: TestValuesDto,
    example: {
      hemoglobin: {
        value: 14.5,
        range: '12.0-16.0 g/dL',
        status: 'normal',
      },
      white_blood_cells: {
        value: 7500,
        range: '4000-11000 cells/μL',
        status: 'normal',
      },
    },
  })
  @ValidateNested()
  @Type(() => TestValuesDto)
  @IsNotEmpty()
  testValues: TestValuesDto;
}
