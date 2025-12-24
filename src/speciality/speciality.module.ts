import { Module } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { SpecialityController } from './speciality.controller';
import { DbModule } from '@src/db/db.module';
import { SpecialityRepository } from '@src/speciality/repository/speciality.repository';

@Module({
  imports:[DbModule], 
  controllers: [SpecialityController],
  providers: [SpecialityService, SpecialityRepository],
  exports: [SpecialityService, SpecialityRepository],
})
export class SpecialityModule {}
