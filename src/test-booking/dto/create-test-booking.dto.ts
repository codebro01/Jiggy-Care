import { IsDateString, IsNotEmpty, IsEnum, IsUUID, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentMethodType } from "@src/payment/dto/paystackMetadataDto";

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
    example: '70fd48ad-c80f-4600-8e9f-c2f9dcb56c5b',
    description:
      'The category of the test that is to be t.e the test kind',
  })
  @IsNotEmpty()
  @IsUUID()
  testId: string;

  @ApiProperty({
    example: '70fd48ad-c80f-4600-8e9f-c2f9dcb56c5b',
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
    example: 'home_collection',
    description:
      'The collection of the test either its home or at the lab center',
  })
  @IsNotEmpty()
  @IsString()
  paymentStatus: string;

  @ApiProperty({
    example: PaymentMethodType.CARD,
    description:
      'Method of payment',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;


  @ApiProperty({
    example: '2025-11-22T09:05:30.123Z',
    description: 'This is the date of  the booking with the time included',
  })
  @IsNotEmpty()
  @IsDateString()
  date: Date;
}
