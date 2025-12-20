import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTestBookingDto } from './dto/create-test-booking.dto';
import { UpdateTestBookingDto } from './dto/update-test-booking.dto';
import { TestBookingRepository } from '@src/test-booking/repository/test-booking.repository';
@Injectable()
export class TestBookingService {
  constructor(private readonly testBookingRepository: TestBookingRepository) {}
  async create(data: CreateTestBookingDto, patientId: string) {
    const bookedDate = new Date(data.date);
    bookedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookedDate < today)
      throw new BadRequestException(
        'You cannot book a test appointment in the past',
      );
    return await this.testBookingRepository.create(
      { ...data, date: new Date(data.date) },
      patientId,
    );
  }

  async findAll(patientId: string) {
    return await this.testBookingRepository.findAll(patientId);
  }

  async findOne(testBookingId: string, patientId: string) {
    return await this.testBookingRepository.findOne(testBookingId, patientId);
  }

  async update(
    data: UpdateTestBookingDto,
    testBookingId: string,
    patientId: string,
  ) {
    return await this.testBookingRepository.update(
      data,
      testBookingId,
      patientId,
    );
  }
}
