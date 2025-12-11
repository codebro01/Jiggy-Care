import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export enum PaymentStatusType {
  COMPLETED = 'completed',
  PENDING = 'pending',
}
export enum PaymentMethodType {
  CARD = 'card',
  TRANSFER = 'transfer',
}

export enum PaymentForType {
  BOOKINGS = 'bookings',
  MEDICATIONS = 'medications',
  TEST_BOOKINGS = 'test_bookings',
}

export class PaystackMetedataDto {

  @ApiProperty({
    description: 'bf4cd48d-441e-4e3c-b504-76ee5045b6e6',
    example: 'An example of the id of the booking',
  })
  @IsString()
  @IsNotEmpty({ message: 'Booking Id is required' })
  bookingId: string;

  @ApiProperty({
    description: 'bf4cd48d-441e-4e3c-b504-76ee5045b6e6',
    example: 'An example of the id of the consultant',
  })
  @IsString()
  @IsNotEmpty({ message: 'consultant Id is required' })
  consultantId: string;
}
