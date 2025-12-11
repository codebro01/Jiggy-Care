import { Injectable } from '@nestjs/common';
import { CreateTestBookingDto } from './dto/create-test-booking.dto';
import { UpdateTestBookingDto } from './dto/update-test-booking.dto';

@Injectable()
export class TestBookingService {
  create(createTestBookingDto: CreateTestBookingDto) {
    return 'This action adds a new testBooking';
  }

  findAll() {
    return `This action returns all testBooking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testBooking`;
  }

  update(id: number, updateTestBookingDto: UpdateTestBookingDto) {
    return `This action updates a #${id} testBooking`;
  }

  remove(id: number) {
    return `This action removes a #${id} testBooking`;
  }
}
