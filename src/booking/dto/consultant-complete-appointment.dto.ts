import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString } from "class-validator";



export class ConsultantCompletedAppointmentDto {


  @ApiProperty({
    example: 'Prescribed Paracetamol 500 grams',
    description: 'Consultant notes containing a few information from the session',
  })
  @IsString()
  @IsNotEmpty()
  notes: string;
}