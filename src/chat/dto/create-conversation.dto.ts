
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'UUID of the consultant initiating the conversation',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  @IsUUID()
  consultantId: string;

  @ApiProperty({
    description: 'UUID of the patient participating in the conversation',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    format: 'uuid',
  })
  @IsUUID()
  patientId: string;


  @ApiProperty({
    description: 'UUID of the appointment or booking',
    example: '5e4e6679-7425-40de-944b-e07fc1f90ae7',
    format: 'uuid',
  })
  @IsUUID()
  bookingId: string;
}
