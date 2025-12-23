import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class VerifyOTPDto {
    @ApiProperty({
        example: 365753, 
        description: "The OTP that was sent to the registered email"
    })
    @IsNotEmpty()
    @IsNumber()
    OTP: number
}