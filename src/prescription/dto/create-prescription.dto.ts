import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  Min,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export enum FrequencyType {
  ONCE_DAILY = 'once_daily',
  TWICE_DAILY = 'twice_daily',
  THRICE_DAILY = 'thrice_daily',
  FOUR_TIMES_DAILY = 'four_times_daily',
  FIVE_TIMES_DAILY = 'five_times_daily',
  OFTEN = 'often',
}

export class CreatePrescriptionDto {
  @ApiProperty({
    example: '19529f98-ef5b-412a-8a0d-49c5f3904ae2',
    description: 'The id of the  patient that the pescription is meant for',
  })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({
    example: 'Diclofenac 500',
    description: 'name of the pill',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '2 X 10mg',
    description: 'The dosage quantity per intake',
  })
  @IsNotEmpty()
  @IsString()
  dosage: string;

  @ApiProperty({
    example: 'once_daily',
    description: 'This is how frequent a person is supposd to take their drugs',
  })
  @IsNotEmpty()
  @IsEnum(FrequencyType, {
    message:
      'frequency is either of the following: once_daily, twice_daily, thrice_daily, four_times_daily, five_times_daily, often ',
  })
  frequency: FrequencyType;

  @ApiProperty({
    example: 4,
    description: 'This is the total number of pills remaining',
  })
  @IsInt()
  @Min(0)
  pillsRemaining: number;

  @ApiProperty({
    example: 10,
    description: 'This is the total number of pills',
  })
  @IsInt()
  @Min(1)
  totalPills: number;

  @ApiProperty({
    example: '2025-10-19T10:50:43Z',
    description:
      'This is the day this person start taking the drugs and it starts counting immediately after purchase of drugs',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: "running_low",
    description: 'This is the status of the  drug where active, running_low or finished',
  })
  @IsOptional()
  @IsString()
  status?: string;
}