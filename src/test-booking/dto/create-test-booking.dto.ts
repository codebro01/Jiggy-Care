import {
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TestTitleType {
  DIABETES = 'diabetes',
  CHOLESTEROL = 'cholesterol',
}

export enum TestCollectionType {
  HOME_COLLECTION = 'home_collection',
  VISIT_LAB_CENTRE = 'visit_lab_centre',
}

export class CreateTestBookingDto {
  @ApiProperty({
    example: '9058e4b3-024a-40df-8561-371097208429',
    description: 'The category of the test that is to be t.e the test kind',
  })
  @IsNotEmpty()
  @IsUUID()
  testId: string;

  @ApiProperty({
    example: '51dcd58d-d192-4803-899a-318de14197e4',
    description:
      'The lab id of the lab that is to host the patientId for the test, and its optional if the coll',
  })
  @IsOptional()
  @IsUUID()
  labId?: string;

  @ApiProperty({
    example: 'home_collection',
    description:
      'The collection of the test either its home or at the lab center',
  })
  @IsNotEmpty()
  @IsEnum(TestCollectionType)
  collection: TestCollectionType;

  @ApiProperty({
    example: '2025-11-22T09:05:30.123Z',
    description: 'This is the date of  the booking with the time included',
  })
  @IsNotEmpty()
  @IsDateString()
  date: Date;
}
