import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsultantRepository } from '@src/consultant/repository/consultant.repository';
import { UpdateConsultantDto } from './dto/updateConsultantDto';
import { UserRepository } from '@src/users/repository/user.repository';
import { HelperRepository } from '@src/helpers/repository/helpers.repository';
import { QueryPendingConsultantApprovalDto } from '@src/consultant/dto/query-consultant-approval.dto';
import { ToggleConsultantApprovalDto } from '@src/consultant/dto/toggle-consultant-approval.dto';

@Injectable()
export class ConsultantService {
  constructor(
    private readonly consultantRepository: ConsultantRepository,
    private readonly userRepository: UserRepository,
    private readonly helperRepository: HelperRepository,
  ) {}

  async updateConsultant(data: UpdateConsultantDto, userId: string) {
    const isExist =
      await this.consultantRepository.findApprovedConsultantById(userId);
    if (!isExist)
      throw new NotFoundException(
        `User with the id: ${userId} could not be found`,
      );
    const consultant = await this.helperRepository.executeInTransaction(
      async (trx) => {
        const consultant = await this.consultantRepository.updateConsultant(
          data,
          userId,
          trx,
        );

        console.log('consultant', consultant);
        const user = await this.userRepository.updateUser(data, userId, trx);
        console.log('user', user);

        return { ...consultant, ...user };
      },
    );

    return consultant;
  }

  async findConsultantByNameOrSpeciality(searchTerm: string) {
    const consultant =
      await this.consultantRepository.findConsultantByNameOrSpeciality(
        searchTerm,
      );

    return consultant;
  }

  async listAllApprovedConsultants() {
    return await this.consultantRepository.listAllApprovedConsultants();
  }

  async pendingConsultantApprovals(query: QueryPendingConsultantApprovalDto) {
    const [pendingConsultantApprovals] =
      await this.consultantRepository.pendingConsultantApprovals(query);

    return pendingConsultantApprovals;
  }

  async toggleConsultantApproval(data: ToggleConsultantApprovalDto) {
    const consultant =
      await this.consultantRepository.findApprovedConsultantById(
        data.consultantId,
      );

    if (!consultant) throw new NotFoundException('Consultant not found');

    const updateConsultant =
      await this.consultantRepository.toggleConsultantApproval(data);

    return updateConsultant;
  }
}
