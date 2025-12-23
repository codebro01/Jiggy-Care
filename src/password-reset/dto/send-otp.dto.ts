import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SendOTPDto {
    @ApiProperty({
        example: 'consultant@example.com', 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string
}