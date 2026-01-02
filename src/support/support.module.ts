import { Module } from '@nestjs/common';
import { SupportController } from '@src/support/support.controller';
import { SupportService } from '@src/support/support.service';
import { DbModule } from '@src/db/db.module';
import { SupportRepository } from '@src/support/repository/support.repository';

@Module({
  imports: [DbModule], 
  controllers: [SupportController],
  providers: [SupportService, SupportRepository], 
  exports: [SupportService, SupportRepository], 
})
export class SupportModule {}
