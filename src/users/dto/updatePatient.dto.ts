import { IsString, IsDateString, IsOptional ,ValidateNested,  IsNotEmpty} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';


export class EmergencyContactDto {
  @ApiProperty({
    example: 'Sister',
    description: 'Relationship to the patient',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string  | null;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Name of emergency contact',
  })
  @IsString()
  @IsNotEmpty()
  name: string  | null;

  @ApiProperty({
    example: '+2348098765432',
    description: 'Phone number of emergency contact',
  })
  @IsString()
  @IsNotEmpty()
  phone: string  | null;
}
export class UpdatePatientDto {
  @ApiPropertyOptional({
    example: 'john_doe',
    description: "User's display name or username",
  })
  @IsString()
  @IsOptional()
  fullName?: string | null;

  @ApiPropertyOptional({
    example: '1995-08-15',
    description: 'Date of birth of the user (ISO 8601 format)',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string  | null;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Gender of the user',
  })
  @IsString()
  @IsOptional()
  gender?: string  | null;

  @ApiPropertyOptional({
    example: '+2348012345678',
    description: "User's phone number (include country code)",
  })
  @IsString()
  @IsOptional()
  phone?: string  | null;

  @ApiPropertyOptional({
    example: '123 Main Street, Lagos',
    description: "User's address",
  })
  @IsString()
  @IsOptional()
  address?: string  | null;

  @ApiPropertyOptional({
    type: EmergencyContactDto,
    description: 'Emergency contact information',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto | null;

  @ApiPropertyOptional({
    example: '70kg',
    description: "User's weight",
  })
  @IsString()
  @IsOptional()
  weight?: string  | null;

  @ApiPropertyOptional({
    example: '175cm',
    description: "User's height",
  })
  @IsString()
  @IsOptional()
  height?: string  | null;

  @ApiPropertyOptional({
    example: 'O+',
    description: "User's blood group",
  })
  @IsString()
  @IsOptional()
  bloodType?: string  | null;
}