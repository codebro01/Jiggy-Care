import { Body, Controller, Post, UseGuards, Req, Res, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { BookingService } from '@src/booking/booking.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { CreateBookingDto } from './dto/createBooking.dto';
import type { Request } from '@src/types';
import type { Response } from 'express';

@Controller('booking')
export class BookingController {

    constructor(private readonly bookingService: BookingService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('patient')
    @Get('available-slots/:consultantId')
    async getAvailableSlots(
        @Param('consultantId') consultantId: string,
        @Query('date') date: string
    ) {
        console.log('consultantId in controller', consultantId)

        return this.bookingService.getAvailableSlots(consultantId, date);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('patient')
    @Post('create')
    async createBooking(
        @Body() body: CreateBookingDto,
        @Req() req: Request, 
        @Res() res: Response, 
    ) {
        // Validate slot is available
        console.log('consultantId in controller', body.consultantId)
        await this.bookingService.validateBookingSlot(
            body.date,
            body.consultantId
        );


        console.log('got past validateBookingSlot')

        // Create booking
     const booking =    await this.bookingService.createBooking(
            body,
            req.user.id, 
            body.consultantId
        );

        res.status(HttpStatus.OK).json({message: "success", data: booking})
    }


}
