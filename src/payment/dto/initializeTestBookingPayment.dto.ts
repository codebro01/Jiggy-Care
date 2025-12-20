import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { TestCollectionType } from '@src/test-booking/dto/create-test-booking.dto';

export class InitializeTestBookingPayment {
  @ApiProperty({
    example: 'ca3ad9c9-e9d4-40a2-89d1-e8ae91461a69',
    description: 'test booking id',
  })
  @IsNotEmpty()
  @IsUUID()
  testBookingId: string;

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
    description:
      'This is the date of the lab test booking with the time included',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
