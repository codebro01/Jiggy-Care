// dto/initialize-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsObject,
  IsUrl,
  IsNotEmpty,
  // IsEnum,
} from 'class-validator';

export enum PaymentForType {
  BOOKINGS = 'bookings',
  MEDICATIONS = 'medications',
}

export class initializeBookingPaymentDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;



  @ApiPropertyOptional({
    description: 'URL to redirect to after payment',
    example: 'https://yourapp.com/payment/callback',
    type: String,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Callback URL must be a valid URL' })
  callback_url?: string;

  @ApiPropertyOptional({
    description: 'Additional data to attach to the transaction',
    example: {
      userId: '123',
      planName: 'Premium Monthly',
      orderId: 'ORD-001',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;

}
