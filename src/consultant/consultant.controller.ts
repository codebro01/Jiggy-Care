import { Controller, UseGuards, Body, Req, Res, HttpStatus, Patch, Query, Get } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { UpdateConsultantDto } from './dto/updateConsultantDto';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { ConsultantService } from './consultant.service';


@Controller('consultant')
export class ConsultantController {
    constructor(private readonly consultantService: ConsultantService) { }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('consultant')
    @Patch('update')
    async updateConsultant(@Body() body: UpdateConsultantDto, @Res() res: Response, @Req() req: Request) {

        const { id: userId } = req.user;

        const consultant = await this.consultantService.updateConsultant(body, userId);

        res.status(HttpStatus.OK).json({ message: "success", data: consultant })
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'patient')
    @Get('find-consultant')
    async findConsultantByNameOrSpeciality(@Query('search') search: string, @Res() res: Response) {

        // const { id: userId } = req.user;

        const consultant = await this.consultantService.findConsultantByNameOrSpeciality(search);

        res.status(HttpStatus.OK).json({ message: "success", data: consultant })
    }

}
