import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '@src/users/repository/user.repository';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import { UpdatePatientDto } from '@src/users/dto/updatePatient.dto';
import { CreateUserDto } from '@src/users/dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { jwtConstants } from '@src/auth/jwtContants';
import {
  consultantTable,
  patientTable,
  userTable,
  UserType,
} from '@src/db/users';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { HelperRepository } from '@src/helpers/repository/helpers.repository';
import { roleType } from '@src/users/dto/createUser.dto';
import { UpdateConsultantDto } from '@src/consultant/dto/updateConsultantDto';

@Injectable()
export class UserService {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly helperRepository: HelperRepository,

    private jwtService: JwtService,
  ) {}

  async createUser(data: CreateUserDto, authProvider: string): Promise<any> {
    try {
      const { email, password } = data;
      if (!email || !password)
        throw new BadRequestException('Please email and password is required');
      const hashedPwd = await bcrypt.hash(password, 10);

      //!  check if google user is already in db before signing up

      if (authProvider === 'google') {
        const [user] = await this.DbProvider.select()
          .from(userTable)
          .where(eq(userTable.email, email));
        if (user) {
          const payload = { id: user.id, email: user.email, role: user.role };

          const accessToken = await this.jwtService.signAsync(payload, {
            secret: jwtConstants.accessTokenSecret,
            expiresIn: '1h',
          });
          const refreshToken = await this.jwtService.signAsync(payload, {
            secret: jwtConstants.refreshTokenSecret,
            expiresIn: '30d',
          });

          const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

          const updateUserToken = await this.DbProvider.update(userTable)
            .set({ refreshToken: hashedRefreshToken })
            .where(eq(userTable.id, user.id));

          if (!updateUserToken) throw new InternalServerErrorException();
          return { user, accessToken };
        }
      }

      //! check if email provided has been used

      const isEmailUsed = await this.DbProvider.select({
        email: userTable.email,
      })
        .from(userTable)
        .where(eq(userTable.email, email));
      console.log(isEmailUsed);
      if (isEmailUsed.length > 0)
        throw new ConflictException(
          'Email already used, please use another email!',
        );

      let user: UserType;

      switch (data.role) {
        case roleType.PATIENT:
          user = await this.helperRepository.executeInTransaction(
            async (trx) => {
              const user = await this.userRepository.createUser(
                { ...data, password: hashedPwd },
                authProvider,
                trx,
              );

              if (!user)
                throw new InternalServerErrorException(
                  'An error occured while inserting user',
                );
              await trx
                .insert(patientTable)
                .values({ userId: user.id })
                .returning();

              return user;
            },
          );
          break;

        case roleType.CONSULTANT:
          user = await this.helperRepository.executeInTransaction(
            async (trx) => {
              const user = await this.userRepository.createUser(
                { ...data, password: hashedPwd },
                authProvider,
                trx,
              );

              if (!user)
                throw new InternalServerErrorException(
                  'An error occured while inserting user',
                );

              await trx
                .insert(consultantTable)
                .values({ userId: user.id })
                .returning();

              return user;
            },
          );
          break;

        // case roleType.ADMIN: (

        //   user = await this.helperRepository.executeInTransaction(async (trx) => {

        //    const admin = await this.userRepository.createUser({ ...data, password: hashedPwd }, authProvider, trx)

        //     if (!admin) throw new InternalServerErrorException('An error occured while inserting user')

        //    return admin;

        //  })
        // )
        // break;

        default:
          throw new BadRequestException(
            'Role can either be consultant or patient',
          );
      }

      //! create user here if email has not been used

      // console.log('user was succesfully created', user)
      if (!user)
        throw new InternalServerErrorException(
          'Could not create user, please try again',
        );

      const payload = { id: user.id, email: user.email, role: user.role };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: '1h',
      });
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshTokenSecret,
        expiresIn: '30d',
      });

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      const updateUserToken = await this.DbProvider.update(userTable)
        .set({ refreshToken: hashedRefreshToken })
        .where(eq(userTable.id, user.id));

      if (!updateUserToken) throw new InternalServerErrorException();
      // console.log('got past this unreachable code')
      return { user, accessToken };
    } catch (dbError) {
      console.error('DB Insert Error:', dbError);

      // rollback Supabase user if DB fails

      throw dbError;
    }
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await this.DbProvider.select().from(userTable);
    return users;
  }

  async updatePatient(data: UpdatePatientDto, userId: string) {
    if (!data) throw new BadRequestException('Data not provided for update!');
    const patient = await this.userRepository.findPatientById(userId);

    if (!patient) throw new NotFoundException('No user found');

    // console.log('updatedUser', updatedUser);

    const updatedPatient = await this.helperRepository.executeInTransaction(
      async (trx) => {
      const user =  await this.userRepository.updateUser(
          {
            fullName: data.fullName || patient.fullName,
            dateOfBirth: data.dateOfBirth || patient.dateOfBirth, 
            gender: data.gender || patient.gender,
            phone: data.phone || patient.phone,
          },
          userId,
          trx,
        );

    const userPatient =    await this.userRepository.updatePatientById(
          {
            emergencyContact: data.emergencyContact || patient.emergencyContact,
            weight: data.weight,
            height: data.height,
            bloodType: data.bloodType,
          },
          userId,
          trx,
        );

              return { ...user, ...userPatient };

      },
    );
    return updatedPatient;
  }
  async updateConsultant(userId: string, data: UpdateConsultantDto) {
    console.log('user', userId);
    if (!data) throw new BadRequestException('Data not provided for update!');
    const consultant = await this.userRepository.findConsultantById(userId);

    if (!consultant) throw new NotFoundException('No user found');

    const updatedConsultant = await this.helperRepository.executeInTransaction(async (trx) => {
      const user =  await this.userRepository.updateUser(
         {
           fullName: data.fullName || consultant.fullName,
           dateOfBirth: data.dateOfBirth || consultant.dateOfBirth,
           gender: data.gender || consultant.gender,
           phone: data.phone || consultant.phone,
         },
         userId,
         trx,
       );
  const userConsultant =     await this.userRepository.updateConsultantById(
        {
          availability:data.availability ||  consultant.availability,
          speciality: data.speciality || consultant.speciality,
          yrsOfExperience: data.yrsOfExperience || consultant.yrsOfExperience,
          about: data.about || consultant.about,
          languages: data.languages || consultant.languages,
          certification: data.certification || consultant.certification,
          workingHours: data.workingHours || consultant.workingHours,
        },
        userId,
        trx,
      );

      return {...user, ...userConsultant}

    })
   
    // console.log('updatedUser', updatedUser);
    return updatedConsultant;
  }

  async getUser (userId: string, role: string) {
      if(role === 'consultant'){
            const consultant =
              await this.userRepository.findConsultantById(userId);


              return consultant;
      }
      if(role === 'patient'){
            const patient =
              await this.userRepository.findPatientById(userId);


              return patient;
      }

      else throw new BadRequestException('Invalid role provided')
  }
}
