import { forwardRef, Module } from '@nestjs/common';
import { ConsultantController } from '@src/consultant/consultant.controller';
import { ConsultantService } from '@src/consultant/consultant.service';
import { ConsultantRepository } from '@src/consultant/repository/consultant.repository';
import { HelpersModule } from '@src/helpers/helpers.module';
import { UserModule } from '@src/users/users.module';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule, HelpersModule, forwardRef(() => UserModule)],
  controllers: [ConsultantController],
  providers: [ConsultantService, ConsultantRepository],
  exports: [ConsultantRepository, ConsultantService]
})
export class ConsultantModule { }
