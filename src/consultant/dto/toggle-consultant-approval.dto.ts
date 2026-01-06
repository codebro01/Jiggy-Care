import { ApiProperty } from "@nestjs/swagger";
import {  IsBoolean, IsNotEmpty, IsUUID } from "class-validator";

export class ToggleConsultantApprovalDto {
  @ApiProperty({
    description: 'The approval status of the consultant',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  approvalStatus: boolean;

  @ApiProperty({
    description: 'Number of items per page',
    example: '02b7b3df-9ba3-4cd3-805f-1d0487e2fba1',
  })
  @IsNotEmpty()
  @IsUUID()
  consultantId: string;
}