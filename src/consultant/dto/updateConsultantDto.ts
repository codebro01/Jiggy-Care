import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsString,
    IsInt,
    IsArray,
    IsOptional,
    IsEmail,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateConsultantDto {
    @ApiPropertyOptional({
        description: 'Consultant availability status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    availability?: boolean;

    @ApiPropertyOptional({
        description: 'Consultant speciality',
        example: 'Mental Health',
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    speciality?: string;

    @ApiPropertyOptional({
        description: 'Years of experience',
        example: 15,
    })
    @IsOptional()
    @IsInt()
    yrsOfExperience: number;

    @ApiPropertyOptional({
        description: 'About the consultant',
        example: 'Experienced consultant specializing in cognitive therapy...',
    })
    @IsOptional()
    @IsString()
    about?: string;

    @ApiPropertyOptional({
        description: 'Languages spoken by the consultant',
        example: ['English', 'Spanish', 'French'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @ApiPropertyOptional({
        description: 'Educational background',
        example: ['PhD in Psychology, Harvard University', 'MSc in Clinical Psychology'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    education?: string[];

    @ApiPropertyOptional({
        description: 'Professional certifications',
        example: ['Licensed Clinical Psychologist', 'CBT Certified'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    certification?: string[];

    @ApiPropertyOptional({
        description: 'Working hours availability',
        example: ['Monday 9:00-17:00', 'Wednesday 10:00-18:00'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    workingHours?: string[];

    @ApiPropertyOptional({
        description: 'Price per consultation session',
        example: 15000,
        minimum: 0,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    pricePerSession?: number;

    //!      Fields from users table
    @ApiPropertyOptional({
        description: 'User email address',
        example: 'consultant@example.com',
        maxLength: 255,
    })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiPropertyOptional({
        description: 'Full name of the consultant',
        example: 'Dr. John Doe',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1985-05-15',
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    dateOfBirth?: string;

    @ApiPropertyOptional({
        description: 'Gender',
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
}