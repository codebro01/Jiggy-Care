import { Injectable, Inject } from '@nestjs/common';
import {
  consultantInsertType,
  consultantTable,
  patientTable,
  userTable,
  userTableInsertType,
  UserType,
} from '@src/db/users';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

import { UpdateUserDto } from '../dto/updateUser.dto';
import { UpdatePatientDto } from '@src/users/dto/updatePatient.dto';
import { specialityTable } from '@src/db';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private jwtService: JwtService,
  ) {}

  // ! create user here

  async createUser(data: userTableInsertType, authProvider: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.insert(userTable)
      .values({ ...data, authProvider })
      .returning();
    return user;
  }

  async findUserById(userId: string) {
    const [user] = await this.DbProvider.select({
      id: userTable.id,
      email: userTable.email,
      phone: userTable.phone,
      role: userTable.role,
      emailVerified: userTable.emailVerified,
      fullName: userTable.fullName,
    })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    return user;
  }
  async findUserByEmail(email: string) {
    const [user] = await this.DbProvider.select({
      id: userTable.id,
      email: userTable.email,
      phone: userTable.phone,
      role: userTable.role,
      emailVerified: userTable.emailVerified,
      fullName: userTable.fullName,
    })
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    return user;
  }
  async findPatientById(userId: string) {
    const [user] = await this.DbProvider.select({
      fullName: userTable.fullName,
      id: userTable.id,
      email: userTable.email,
      dateOfBirth: userTable.dateOfBirth,
      phone: userTable.phone,
      role: userTable.role,
      address: userTable.address,
      emailVerified: userTable.emailVerified,
      bloodType: patientTable.bloodType,
      emergencyContact: patientTable.emergencyContact,
      height: patientTable.height,
      weight: patientTable.weight,
      gender: userTable.gender,
    })
      .from(patientTable)
      .where(eq(patientTable.userId, userId))
      .leftJoin(userTable, eq(userTable.id, userId))
      .limit(1);

    return user;
  }
  async findApprovedConsultantById(userId: string) {
    const [user] = await this.DbProvider.select({
      fullName: userTable.fullName,
      id: userTable.id,
      email: userTable.email,
      dateOfBirth: userTable.dateOfBirth,
      phone: userTable.phone,
      address: userTable.address,
      role: userTable.role,
      emailVerified: userTable.emailVerified,
      availability: consultantTable.availability,
      speciality: consultantTable.speciality,
      yrsOfExperience: consultantTable.yrsOfExperience,
      about: consultantTable.about,
      languages: consultantTable.languages,
      certification: consultantTable.certification,
      workingHours: consultantTable.workingHours,
      gender: userTable.gender,
    })
      .from(consultantTable)
      .where(eq(consultantTable.userId, userId))
      .leftJoin(userTable, eq(userTable.id, userId))
      .leftJoin(
        specialityTable,
        eq(specialityTable.id, consultantTable.speciality),
      )
      .limit(1);

    return user;
  }

  async updateUser(
    data: UpdateUserDto & { emailVerified?: boolean },
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(userTable)
      .set({ ...data })
      .where(eq(userTable.id, userId))
      .returning();
    return user;
  }

  async updateUserTokenByUserId(refreshToken: string, userId: string) {
    const newToken = await this.DbProvider.update(userTable)
      .set({ refreshToken: refreshToken })
      .where(eq(userTable.id, userId));

    return newToken;
  }
  async updateUserByEmail(
    data: UpdateUserDto & { emailVerified?: boolean },
    email: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(userTable)
      .set({ ...data })
      .where(eq(userTable.email, email))
      .returning();
    return user;
  }
  async updateUserPasswordByEmail(
    data: { password: string },
    email: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(userTable)
      .set({ password: data.password })
      .where(eq(userTable.email, email))
      .returning();
    return user;
  }

  async updateConsultantById(
    data: Partial<
      Omit<consultantInsertType, 'id' | 'userId' | 'pricePerSession'>
    >,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(consultantTable)
      .set({ ...data })
      .where(eq(consultantTable.userId, userId))
      .returning();
    return user;
  }
  async updatePatientById(data: UpdatePatientDto, userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(patientTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patientTable.userId, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await this.DbProvider.select().from(userTable);
    return users;
  }
}
