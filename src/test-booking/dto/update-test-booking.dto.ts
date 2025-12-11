import { PartialType } from '@nestjs/swagger';
import { CreateTestBookingDto } from './create-test-booking.dto';

export class UpdateTestBookingDto extends PartialType(CreateTestBookingDto) {}
