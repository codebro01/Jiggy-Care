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
import { readingStatusType } from '@src/db/health-monitoring';

class TestValueDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsNotEmpty()
  range: string;

  @IsEnum(['normal', 'high', 'low', 'critical'])
  @IsNotEmpty()
  status: readingStatusType;
}

class TestValuesDto {
  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  hemoglobin?: TestValueDto;

  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  hematrocit?: TestValueDto;

  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  white_blood_cells?: TestValueDto;

  @ValidateNested()
  @Type(() => TestValueDto)
  @IsOptional()
  platelets?: TestValueDto;
}

export class CreateTestResultDto {
  @IsUUID()
  @IsOptional()
  labId?: string;

  @IsUUID()
  @IsOptional()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ValidateNested()
  @Type(() => TestValuesDto)
  @IsNotEmpty()
  testValues: TestValuesDto;
}
