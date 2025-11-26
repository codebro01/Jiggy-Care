import { Module } from '@nestjs/common';
import { PrescriptionService } from '@src/prescription/prescription.service';
import { PrescriptionController } from '@src/prescription/prescription.controller';
import { PrescriptionRepository } from '@src/prescription/repository/prescription.repository';
import { DbModule } from '@src/db/db.module';
@Module({
  imports: [DbModule],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrescriptionRepository],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
