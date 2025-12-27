import { Injectable, Inject } from '@nestjs/common';
import { testTable } from '@src/db';
import { CreateTestDto } from '@src/test/dto/create-test.dto';
import { QueryTestDto } from '@src/test/dto/query-test.dto';
import { UpdateTestDto } from '@src/test/dto/update-test.dto';
import { eq, like, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TestRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async create(CreateTestDto: CreateTestDto, userId: string) {
    const [test] = await this.DbProvider.insert(testTable)
      .values({ ...CreateTestDto, createdBy: userId })
      .returning();
    return test;
  }

  async findAll(query: QueryTestDto) {
    const conditions = [];
    if (query.search) {
      conditions.push(like(testTable.title, `%${query.search}%`));
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const offset = (page - 1) * limit;

    const test = await this.DbProvider.select({
      id: testTable.id,
      title: testTable.title,
      description: testTable.description,
      durationInHrs: testTable.durationInHrs,
      amount: testTable.amount,
      preparation: testTable.preparation,
    })
      .from(testTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .offset(offset)
      .orderBy(testTable.title);
    return test;
  }

  async findOne(testId: string) {
    const [test] = await this.DbProvider.select({
      id: testTable.id,
      title: testTable.title,
      description: testTable.description,
      durationInHrs: testTable.durationInHrs,
      amount: testTable.amount,
      preparation: testTable.preparation,
    })
      .from(testTable)
      .where(eq(testTable.id, testId))
      .limit(1);

    return test;
  }

  async update(UpdateTestDto: UpdateTestDto, testId: string) {
    const [test] = await this.DbProvider.update(testTable)
      .set(UpdateTestDto)
      .where(eq(testTable.id, testId))
      .returning();
    return test;
  }
}
