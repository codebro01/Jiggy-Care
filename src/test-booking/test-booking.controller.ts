import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestBookingService } from './test-booking.service';
import { CreateTestBookingDto } from './dto/create-test-booking.dto';
import { UpdateTestBookingDto } from './dto/update-test-booking.dto';

@Controller('test-booking')
export class TestBookingController {
  constructor(private readonly testBookingService: TestBookingService) {}

  @Post()
  create(@Body() createTestBookingDto: CreateTestBookingDto) {
    return this.testBookingService.create(createTestBookingDto);
  }

  @Get()
  findAll() {
    return this.testBookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testBookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestBookingDto: UpdateTestBookingDto) {
    return this.testBookingService.update(+id, updateTestBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testBookingService.remove(+id);
  }
}
