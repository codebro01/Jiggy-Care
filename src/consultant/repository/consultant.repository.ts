import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  consultantTable,
  userTable,
  specialityTable,
  ratingTable,
  bookingTable,
} from '@src/db';
import { and, avg, eq, ilike, or } from 'drizzle-orm';
import { UpdateConsultantDto } from '@src/consultant/dto/updateConsultantDto';
import { QueryPendingConsultantApprovalDto } from '@src/dashboard/dto/query-consultant-approval.dto';
import { ToggleConsultantApprovalDto } from '@src/consultant/dto/toggle-consultant-approval.dto';

@Injectable()
export class ConsultantRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createConsultant(userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [consultant] = await Trx.insert(consultantTable)
      .values({ userId })
      .returning();

    return consultant;
  }

  async updateConsultant(data: UpdateConsultantDto, userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [consultant] = await Trx.update(consultantTable)
      .set(data)
      .where(eq(consultantTable.userId, userId))
      .returning();

    return consultant;
  }

  async findApprovedConsultantById(userId: string) {
    const [consultant] = await this.DbProvider.select()
      .from(consultantTable)
      .where(
        and(
          eq(consultantTable.userId, userId),
          eq(consultantTable.approvedStatus, true),
        ),
      );

    return consultant;
  }

  async findConsultantByNameOrSpeciality(searchTerm: string) {
    const consultants = await this.DbProvider.select({
      id: consultantTable.id,
      userId: consultantTable.userId,
      availability: consultantTable.availability,
      yrsOfExperience: consultantTable.yrsOfExperience,
      about: consultantTable.about,
      languages: consultantTable.languages,
      education: consultantTable.education,
      certification: consultantTable.certification,
      workingHours: consultantTable.workingHours,
      speciality: specialityTable.name,
      pricePerSession: specialityTable.price,
      // User details
      userName: userTable.fullName,
      userEmail: userTable.email,
      userProfilePicture: userTable.dp,
      dateCreated: userTable.createdAt,
      fullName: userTable.fullName,
    })
      .from(consultantTable)
      .leftJoin(userTable, eq(consultantTable.userId, userTable.id))
      .leftJoin(
        specialityTable,
        eq(specialityTable.id, consultantTable.speciality),
      )
      .leftJoin(userTable, eq(userTable.id, consultantTable.userId))

      .where(
        and(
          eq(consultantTable.approvedStatus, true),
          or(
            ilike(userTable.fullName, `%${searchTerm}%`),
            ilike(consultantTable.speciality, `%${searchTerm}%`),
          ),
        ),
      );

    return consultants;
  }

  async listAllApprovedConsultants() {
    const consultants = await this.DbProvider.select({
      id: consultantTable.id,
      userId: consultantTable.userId,
      availability: consultantTable.availability,
      yrsOfExperience: consultantTable.yrsOfExperience,
      about: consultantTable.about,
      languages: consultantTable.languages,
      education: consultantTable.education,
      certification: consultantTable.certification,
      workingHours: consultantTable.workingHours,
      approvedStatus: consultantTable.approvedStatus,
      createdAt: consultantTable.createdAt,
      updatedAt: consultantTable.updatedAt,

      speciality: specialityTable.name,
      pricePerSession: specialityTable.price,
      fullName: userTable.fullName,

      rating: avg(ratingTable.rating),
    })
      .from(consultantTable)
      .where(eq(consultantTable.approvedStatus, true))
      .leftJoin(
        specialityTable,
        eq(specialityTable.id, consultantTable.speciality),
      )
      .leftJoin(
        ratingTable,
        eq(ratingTable.consultantId, consultantTable.userId),
      )
      .leftJoin(userTable, eq(userTable.id, consultantTable.userId))
      .groupBy(
        consultantTable.id,
        consultantTable.userId,
        consultantTable.availability,
        consultantTable.yrsOfExperience,
        consultantTable.about,
        consultantTable.languages,
        consultantTable.education,
        consultantTable.certification,
        consultantTable.workingHours,
        consultantTable.approvedStatus,
        consultantTable.createdAt,
        consultantTable.updatedAt,
        specialityTable.name,
        specialityTable.price,
        userTable.fullName,
      );

    return consultants;
  }

  // * ============================ admin section ======================================//

  async pendingConsultantApprovals(query: QueryPendingConsultantApprovalDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const offset = (page - 1) * limit;
    const pendingConsultantApprovals = await this.DbProvider.select()
      .from(consultantTable)
      .where(and(eq(consultantTable.approvedStatus, true)))
      .limit(limit)
      .offset(offset);

    return pendingConsultantApprovals;
  }

  async toggleConsultantApproval(data: ToggleConsultantApprovalDto) {
    const [consultant] = await this.DbProvider.update(consultantTable)
      .set({ approvedStatus: data.approvalStatus })
      .where(eq(consultantTable.userId, data.consultantId))
      .returning();

    return consultant;
  }

  async getConsultantPatients(consultantId: string) {
    const patients = await this.DbProvider.select({
      patientId: userTable.id, 
      fullName: userTable.fullName, 
    })
      .from(bookingTable)
      .where(
        and(
          eq(bookingTable.consultantId, consultantId),
          eq(bookingTable.paymentStatus, true),
        ),
      )
      .leftJoin(userTable, eq(userTable.id, bookingTable.patientId))
      .groupBy(
        userTable.id,
        userTable.fullName,
        userTable.email,
        userTable.phone,
        bookingTable.createdAt,
      ); 

    return patients;
  }
}
