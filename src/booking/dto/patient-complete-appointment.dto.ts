import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";



export class PatientCompletedAppointmentDto {
  @ApiProperty({
    example: true,
    description: 'If confirmed then true else false',
  })
  @IsBoolean()
  @IsNotEmpty()
  confirmed: boolean;

  @ApiProperty({
    example: 'I was not available for the meeting',
    description: 'Reason is only required if you set the confirmed status false',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}