import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    // IsEmail,
    IsString,
    IsBoolean,
    IsOptional,
    MaxLength,
    // MinLength,
} from 'class-validator';

export class UpdateUserDto {
    // @ApiPropertyOptional({
    //     description: 'User email address',
    //     example: 'user@example.com',
    //     maxLength: 255,
    // })
    // @IsOptional()
    // @IsEmail()
    // @MaxLength(255)
    // email?: string;

    // @ApiPropertyOptional({
    //     description: 'User password',
    //     example: 'SecurePassword123!',
    //     maxLength: 255,
    //     minLength: 8,
    // })
    // @IsOptional()
    // @IsString()
    // @MinLength(8)
    // @MaxLength(255)
    // password?: string;

    @ApiPropertyOptional({
        description: 'Full name of the user',
        example: 'John Doe',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1990-01-15',
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    dateOfBirth?: string;

    @ApiPropertyOptional({
        description: 'Gender of the user',
        example: 'Male',
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    gender?: string;

    @ApiPropertyOptional({
        description: 'Display picture URL',
        example: 'https://example.com/images/profile.jpg',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    dp?: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+1234567890',
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @ApiPropertyOptional({
        description: 'Email verification status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    emailVerified?: boolean;
}