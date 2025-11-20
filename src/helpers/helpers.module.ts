import { Module } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { DbModule } from '@src/db/db.module';
import { HelperRepository } from '@src/helpers/repository/helpers.repository';
@Module({
  imports: [DbModule],
  providers: [HelpersService, HelperRepository],
  exports: [HelperRepository, HelpersService]
})
export class HelpersModule { }
