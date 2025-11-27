import { Module } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { MedicationRepository } from './medication.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports:[DbModule], 
  controllers: [MedicationController],
  providers: [MedicationService, MedicationRepository],
  exports: [MedicationService, MedicationRepository]
})
export class MedicationModule {}
