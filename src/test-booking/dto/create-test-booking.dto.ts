import { IsDateString, IsNotEmpty, IsEnum, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum TestTitleType {
  DIABETES = 'diabetes',
  CHOLESTEROL = 'cholesterol',
}

export enum TestCollectionType {
    HOME_COLLECTION = 'home_collection', 
    VISIT_LAB_CENTER = 'visit_lab_center'
}

export class CreateTestBookingDto {
  @ApiProperty({
    example: '70fd48ad-c80f-4600-8e9f-c2f9dcb56c5b',
    description:
      'The category of the test that is to be take, i.e the test kind',
  })
  @IsNotEmpty()
  @IsUUID()
  testId: string;

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
  date: string;
}
