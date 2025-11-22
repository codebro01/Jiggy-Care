import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsDateString, IsArray } from "class-validator";

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
    @IsNotEmpty()
    @IsNumber()
    duration: number


    @ApiProperty({
        example: ['headache', 'sore throat', 'tiredness'], 
        description: "This is the array of symptoms"
    })
    @IsNotEmpty()
    @IsArray()
    symptoms: string[]


}
