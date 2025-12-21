// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum roleType {
  CONSULTANT = 'consultant',
  PATIENT = 'patient',
}


export class CreateUserDto {

  @ApiProperty({ example: 'consultant', description: 'only the roles with value consultant or patient is allowed' })
  @IsEnum(roleType, {message: 'only the value consultant or patient is accepted'})
  @IsNotEmpty()
  role: roleType;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

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
