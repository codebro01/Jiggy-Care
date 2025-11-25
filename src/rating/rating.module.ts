import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { DbModule } from '@src/db/db.module';
import { RatingRepository } from './repository/rating.repository';

@Module({
  imports: [DbModule],
  controllers: [RatingController],
  providers: [RatingService, RatingRepository],
  exports: [RatingService, RatingModule]
})
export class RatingModule {}
