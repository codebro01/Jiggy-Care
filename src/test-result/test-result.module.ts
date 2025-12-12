import { Module } from '@nestjs/common';
import { TestResultService } from './test-result.service';
import { TestResultController } from './test-result.controller';
import { TestResultRepository } from '@src/test-result/repository/test-result.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports:[DbModule], 
  controllers: [TestResultController],
  providers: [TestResultService, TestResultRepository],
  exports: [TestResultService, TestResultRepository],
})
export class TestResultModule {}
