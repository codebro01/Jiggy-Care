// create-many-prescriptions.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested, ArrayMinSize } from 'class-validator';
import { CreatePrescriptionDto } from './create-prescription.dto';

export class CreateManyPrescriptionsDto {
  @IsUUID()
  patientId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionDto)
  prescriptions: CreatePrescriptionDto[];
}
