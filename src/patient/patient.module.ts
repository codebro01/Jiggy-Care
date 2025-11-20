import { forwardRef, Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { UserModule } from '@src/users/users.module';
import { DbModule } from '@src/db/db.module';
import { PatientRepository } from './repository/patient.repository';

@Module({
  imports: [forwardRef(() => UserModule), DbModule], 
  providers: [PatientService, PatientRepository],
  controllers: [PatientController], 
  exports: [PatientRepository, PatientService]
})
export class PatientModule {}
