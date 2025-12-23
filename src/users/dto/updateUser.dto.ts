import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    // IsEmail,
    IsString,
    IsOptional,
    MaxLength,
    // MinLength,
} from 'class-validator';

export class UpdateUserDto {
  

    @ApiPropertyOptional({
        description: 'Full name of the user',
        example: 'John Doe',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string  | null;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1990-01-15',
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    dateOfBirth?: string  | null;

    @ApiPropertyOptional({
        description: 'Gender of the user',
        example: 'Male',
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    gender?: string  | null;

    @ApiPropertyOptional({
        description: 'Display picture URL',
        example: 'https://example.com/images/profile.jpg',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    dp?: string  | null;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+1234567890',
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string  | null;

   
}