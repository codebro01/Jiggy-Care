import { Injectable } from '@nestjs/common';
import { ConsultantRepository } from '@src/consultant/repository/cosultant.repository';
import { UpdateConsultantDto } from './dto/updateUserDto';

@Injectable()
export class ConsultantService {
   constructor(private readonly consultantRepository: ConsultantRepository){}

   async updateConsultant(data: UpdateConsultantDto, userId: string) {
      const consultant = await this.consultantRepository.updateConsultant(data, userId)

      return consultant
   }
}
