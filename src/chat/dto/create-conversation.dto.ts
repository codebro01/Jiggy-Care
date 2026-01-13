
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'UUID of the consultant initiating the conversation',
    example: '02b7b3df-9ba3-4cd3-805f-1d0487e2fba1',
    format: 'uuid',
  })
  @IsUUID()
  consultantId: string;

  @ApiProperty({
    description: 'UUID of the patient participating in the conversation',
    example: '23d7a38f-f298-41ac-8ed5-f1c22cc75b61',
    format: 'uuid',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'UUID of the appointment or booking',
    example: '4e2e8be5-d7ab-4f36-9ed8-8ff78ba120e4',
    format: 'uuid',
  })
  @IsUUID()
  bookingId: string;
}
