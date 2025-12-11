import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { TestCollectionType } from '@src/test-booking/dto/create-test-booking.dto';

export class InitializeTestBookingPayment {
  @ApiProperty({
    example: '70fd48ad-c80f-4600-8e9f-c2f9dcb56c5b',
    description: 'id of the test type to be taken ',
  })
  @IsNotEmpty()
  @IsUUID()
  testId: string;

  @ApiProperty({
    example: '70fd48ad-c80f-4600-8e9f-c2f9dcb56c5b',
    description: 'id of the lab where the test will be taken',
  })
  @IsNotEmpty()
  @IsUUID()
  labId: string;

  @ApiProperty({
    example: `${TestCollectionType.HOME_COLLECTION}`,
    description:
      'The collection type of the lab test and it can either be home_collection or visit_lab_centre',
  })
  @IsNotEmpty()
  @IsEnum(TestCollectionType)
  collection: TestCollectionType;

  @ApiProperty({
    example: '2025-11-22T09:05:30.123Z',
    description: 'This is the date of the lab test booking with the time included',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
