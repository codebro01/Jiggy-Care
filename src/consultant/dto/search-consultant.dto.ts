import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchConsultantDto {
  @ApiProperty({
    example: 'dentist',
    description:
      'The speciality or field of a doctor such as dentist, general practitioner, etc',
  })
  @IsNotEmpty()
  @IsString()
  query: string;
}
