import { Module } from '@nestjs/common';
import { ConsultantController } from '@src/consultant/consultant.controller';
import { ConsultantService } from '@src/consultant/consultant.service';
import { ConsultantRepository } from '@src/consultant/repository/cosultant.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ConsultantController],
  providers: [ConsultantService, ConsultantRepository],
  exports: [ConsultantRepository]
})
export class ConsultantModule {}
