import {
  Injectable, Inject, BadRequestException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '@src/users/repository/user.repository';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import { UpdatePatientDto } from '@src/users/dto/update-patient.dto';
import { CreateUserDto } from '@src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { jwtConstants } from '@src/auth/jwtContants';
import { userTable, UserType } from '@src/db/users';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';





@Injectable()
export class UserService {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private jwtService: JwtService,
  ) { }

  async createUser(
    data: CreateUserDto, authProvider: string
  ): Promise<any> {
    try {
      const { email, password } = data;
      if (!email || !password)
        throw new BadRequestException('Please email and password is required');
      const hashedPwd = await bcrypt.hash(password, 10);

      //!  check is google user is already in db before signing up

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

      //! create user here if email has not been used

      const user = await this.userRepository.createUser({ ...data, password: hashedPwd }, authProvider)

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
      return { user, accessToken, refreshToken };
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

  async updateUser(userId:string, data: UpdatePatientDto) {
    console.log('user', userId);
    if (!data) throw new BadRequestException('Data not provided for update!');
    const [isUserExist] = await this.DbProvider.select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!isUserExist) throw new NotFoundException('No user found');
    console.log(isUserExist);
    const updatedUser = await this.DbProvider.update(userTable)
      .set(data)
      .where(eq(userTable.id, userId))
      .returning();
    if (!updatedUser)
      throw new InternalServerErrorException(
        'An error occurred while updating the user, please try again',
      );
    console.log('updatedUser', updatedUser);
    return { updatedUser };
  }
}

