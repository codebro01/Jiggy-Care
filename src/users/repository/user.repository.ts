import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { userTable } from '@src/db/users';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';


import { CreateUserDto } from '@src/users/dto/createUser.dto';
import { UpdateUserDto } from '../dto/updateUser.dto';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private jwtService: JwtService,
  ) { }

  // ! create user here



  async createUser(data: CreateUserDto, authProvider: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.insert(userTable).values({ ...data, authProvider }).returning();
    return user;
  }


  async updateUser(data: UpdateUserDto , userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(userTable).set({ data }).where(eq(userTable.id, userId)).returning();
    return user;
  }
}
