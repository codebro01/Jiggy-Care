import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: 'What are the symptoms of malaria?',
    description: 'Message of the user to the AI',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: '1111-2222-3333-4444',
    description: 'This is the session id of the user discussion with the AI',
  })
  @IsUUID()
  @IsOptional()
  sessionId?: string; // if null, backend will create a new session
}
