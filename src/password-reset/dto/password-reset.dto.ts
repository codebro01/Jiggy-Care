import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MinLength, Matches } from "class-validator";


export class PasswordResetDto {
    @ApiProperty({
        example: 365753, 
        description: "The OTP that was sent to the registered email"
    })
    @IsNotEmpty()
    @IsNumber()
    OTP: number


      @ApiProperty({ example: '@Example123', minLength: 8 })
      @IsNotEmpty()
      @IsString()
      @MinLength(8)
      @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
        message:
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
      })
      password: string;
    }
