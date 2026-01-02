import { Module } from '@nestjs/common';
import { SupportController } from '@src/support/support.controller';
import { SupportService } from '@src/support/support.service';
import { DbModule } from '@src/db/db.module';
import { SupportRepository } from '@src/support/repository/support.repository';
import { SupportGateway } from '@src/support/support.gateway';

@Module({
  imports: [DbModule], 
  controllers: [SupportController],
  providers: [SupportService, SupportRepository, SupportGateway], 
  exports: [SupportService, SupportRepository, SupportGateway], 
})
export class SupportModule {}
