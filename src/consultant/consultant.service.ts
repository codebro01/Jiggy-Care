import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsultantRepository } from '@src/consultant/repository/consultant.repository';
import { UpdateConsultantDto } from './dto/updateConsultantDto';
import { UserRepository } from '@src/users/repository/user.repository';
import { HelperRepository } from '@src/helpers/repository/helpers.repository';

@Injectable()
export class ConsultantService {
   constructor(private readonly consultantRepository: ConsultantRepository, private readonly userRepository: UserRepository, private readonly helperRepository: HelperRepository) { }

   async updateConsultant(data: UpdateConsultantDto, userId: string) {

      const isExist = await this.consultantRepository.findConsultantById(userId);
      if (!isExist) throw new NotFoundException(`User with the id: ${userId} could not be found`)
         console.log('is exist', isExist)
      const consultant = await this.helperRepository.executeInTransaction(async (trx) => {
         const consultant = await this.consultantRepository.updateConsultant(data, userId, trx)

         console.log('consultant', consultant)
         const user = await this.userRepository.updateUser(data, userId, trx)
         console.log('user', user)

         return { ...consultant, ...user }
      })

      return consultant
   }

   async findConsultantByNameOrSpeciality(searchTerm: string) {
      const consultant  = await this.consultantRepository.findConsultantByNameOrSpeciality(searchTerm);

      return consultant;
   }
}
