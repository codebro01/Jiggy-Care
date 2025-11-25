import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [RatingController],
  providers: [RatingService, RatingModule],
  exports: [RatingService, RatingModule]
})
export class RatingModule {}
