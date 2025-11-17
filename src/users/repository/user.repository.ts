import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { userTable } from '@src/db/users';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtService } from '@nestjs/jwt';


import { CreateUserDto } from '@src/users/dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private jwtService: JwtService,
  ) {}

  // ! create user here



  async createUser(data: CreateUserDto, authProvider:string) {
         const [user] = await this.DbProvider.insert(userTable).values({...data, authProvider}).returning();
         return user;
  }
}
