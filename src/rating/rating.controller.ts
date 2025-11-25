import { Controller, Post, UseGuards, Res, Req, Body, HttpStatus, Query} from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { RatingService } from '@src/rating/rating.service';
import { CreateRatingDto } from './dto/createRatingDto';
import type { Response } from 'express';
import type { Request } from '@src/types';

@Controller('rating')
export class RatingController {
constructor(private readonly ratingService: RatingService){}


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('patient')
    @Post('create')
    async createRating(@Body() body: CreateRatingDto, @Res() res: Response, @Req() req: Request){
         const rating = await this.ratingService.createRating(body, req.user.id, body.consultantId);

         res.status(HttpStatus.OK).json({message: 'success', data: rating})
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('patient')
    @Post('create')
    async findConsultantRating(@Query('consultantId') consultantId: string, @Res() res: Response){

        const rating = await this.ratingService.findConsultantRatings(consultantId);

         res.status(HttpStatus.OK).json({message: 'success', data: rating})
    }
}
