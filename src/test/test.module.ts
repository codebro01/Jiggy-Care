import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TestRepository } from '@src/test/repository/test.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule], 
  controllers: [TestController],
  providers: [TestService, TestRepository],
  exports: [TestService, TestRepository],
})
export class TestModule {}
