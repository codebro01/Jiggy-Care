import { BadRequestException, Injectable } from '@nestjs/common';
import { RatingRepository } from '@src/rating/repository/rating.repository';
import { CreateRatingDto } from './dto/createRatingDto';

@Injectable()
export class RatingService {

    constructor(private readonly ratingRepository: RatingRepository){}

    async createRating(data: CreateRatingDto, patientId: string, consultantId:string) {
        const rating = await this.ratingRepository.createRating(data, patientId, consultantId)

        if(!rating) throw new BadRequestException('Could not create rating')

        return rating;
    }

    async findConsultantRatings(consultantId:string) {
        const rating = await this.ratingRepository.findConsultantRatings(consultantId)

        return rating;
    }
}
