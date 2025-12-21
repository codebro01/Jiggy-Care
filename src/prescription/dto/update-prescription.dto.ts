import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
      @ApiProperty({
        example: 4,
        description: 'This is the total number of pills remaining',
      })
      @IsInt()
      @Min(0)
      pillsRemaining: number;
}
