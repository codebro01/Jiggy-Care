import { Module } from '@nestjs/common';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';
import { DbModule } from '@src/db/db.module';
import { LabRepository } from '@src/lab/repository/lab.repository';

@Module({
  imports: [DbModule], 
  controllers: [LabController],
  providers: [LabService, LabRepository],
  exports: [LabService, LabRepository]
})
export class LabModule {}
