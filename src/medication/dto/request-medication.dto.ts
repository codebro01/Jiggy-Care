import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMedicationRequestDto {
  @ApiProperty({ example: 'Paracetamol' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsNotEmpty()
  gram: number;
}
