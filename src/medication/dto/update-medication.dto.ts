import { PartialType } from '@nestjs/swagger';
import { CreateMedicationDto } from '@src/medication/dto/create-medication.dto';

export class UpdateMedicationDto extends PartialType(CreateMedicationDto) {}
