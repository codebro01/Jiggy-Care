import { ApiProperty } from "@nestjs/swagger";
import {IsString, IsNumber, IsNotEmpty, IsDateString, IsOptional } from "class-validator";

export class CreateBookingDto {
    @ApiProperty({
        example: "2025-11-22T09:05:30.123Z", 
        description: "This is the date of  the booking with the time included"
    })
    @IsNotEmpty()
    @IsDateString()
    date: string


    @ApiProperty({
        example: 2, 
        description: "The duration is in hours and the default is 1 if none is passed"
    })
    @IsOptional()
    @IsNumber()
    duration?: number


    @ApiProperty({
        example: 'headache, tiredness, sore throat', 
        description: "This is the array of symptoms"
    })
    @IsNotEmpty()
    @IsString()
    symptoms: string

    @ApiProperty({
        example: "2515a51b-d272-415a-b20c-90cafa9e53c4", 
        description: "This is the id of the consultant that the patient is booking"
    })
    @IsNotEmpty()
    @IsString()
    consultantId: string


}
