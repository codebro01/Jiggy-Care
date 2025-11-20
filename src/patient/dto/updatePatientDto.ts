import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
} from 'class-validator';

export class UpdatePatientDto {
    @ApiPropertyOptional({
        description: 'Emergency contact phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsString()
    emergencyContact?: string;

    @ApiPropertyOptional({
        description: 'Patient weight (in kg)',
        example: '75.5',
    })
    @IsOptional()
    @IsString()
    weight?: string;

    @ApiPropertyOptional({
        description: 'Patient height (in cm)',
        example: '175',
    })
    @IsOptional()
    @IsString()
    height?: string;

    @ApiPropertyOptional({
        description: 'Blood type',
        example: 'O+',
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    })
    @IsOptional()
    @IsString()
    bloodType?: string;
}