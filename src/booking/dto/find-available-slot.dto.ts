import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class FindAvailableSlotDto {
  @ApiProperty({
    example: '6a955baf-805b-4c77-b688-70adf9ab2df5',
    description: 'Id of an approved consultant',
  })
  @IsNotEmpty()
  @IsUUID()
  consultantId: string;

  @ApiProperty({
    example: '2025-12-29T10:00:00',
    description: 'Date time  string',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
