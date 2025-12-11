import { Injectable, Inject } from '@nestjs/common';
import { testTable } from '@src/db';
import { CreateTestDto } from '@src/test/dto/create-test.dto';
import { UpdateTestDto } from '@src/test/dto/update-test.dto';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


@Injectable()
export class TestRepository {
     constructor(
        @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
      ) { }
  async create(CreateTestDto: CreateTestDto, userId: string) {
    const [lab] = await this.DbProvider.insert(testTable).values({...CreateTestDto, createdBy: userId}).returning()
    return lab;
  }

  async findAll() {
    const lab = await this.DbProvider.select({
        id: testTable.id, 
        title: testTable.title, 
        description: testTable.description, 
        durationInHrs: testTable.durationInHrs, 
        amount: testTable.amount, 
        preparation: testTable.preparation, 
    }).from(testTable);

    return lab;
  }

  async findOne(labId: string) {
       const lab = await this.DbProvider.select({
         id: testTable.id,
         title: testTable.title,
         description: testTable.description,
         durationInHrs: testTable.durationInHrs,
         amount: testTable.amount,
         preparation: testTable.preparation,
       })
         .from(testTable)
         .where(eq(testTable.id, labId));

       return lab;
  }

  async update(UpdateTestDto: UpdateTestDto, testId: string) {
    const [lab] = await this.DbProvider.update(testTable).set(UpdateTestDto).where(eq(testTable.id, testId)).returning();
    return lab;
  }
}
