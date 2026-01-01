import { forwardRef, Module } from '@nestjs/common';
import { PrescriptionService } from '@src/prescription/prescription.service';
import { PrescriptionController } from '@src/prescription/prescription.controller';
import { PrescriptionRepository } from '@src/prescription/repository/prescription.repository';
import { DbModule } from '@src/db/db.module';
import { UserModule } from '@src/users/users.module';
@Module({
  imports: [DbModule, forwardRef(() => UserModule)],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrescriptionRepository],
  exports: [PrescriptionService, PrescriptionRepository],
})
export class PrescriptionModule {}
