// src/dtos/create-message.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'UUID of the consultant involved in the conversation',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  @IsUUID()
  consultantId: string;

  @ApiProperty({
    description: 'UUID of the patient involved in the conversation',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    format: 'uuid',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello doctor, I have been experiencing headaches lately.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Who sent the message',
    enum: ['consultant', 'patient'],
    example: 'patient',
  })
  @IsIn(['consultant', 'patient'])
  senderType: 'consultant' | 'patient';
}
