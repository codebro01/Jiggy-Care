import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty,  IsEmail, IsString } from "class-validator";

export class SendOTPDtoForEmailVerification {
    @ApiProperty({
        example: 'johndoe@example.com', 
        description: "The OTP that was sent to the registered email"
    })
    @IsEmail()
    @IsNotEmpty()
    email: string


    @ApiProperty({
        example: "John Doe", 
        description: "The fullname of the user"
    })
    @IsString()
    @IsNotEmpty()
    fullName: string

}