import { Inject, Injectable } from '@nestjs/common';
import { testResultTableInsertType, testResultTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
import { consultantTable, patientTable, userTable } from '@src/db/users';
import { labTable } from '@src/db/lab';

@Injectable()
export class TestResultRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createTestResult(data: testResultTableInsertType) {
    const [testResult] = await this.DbProvider.insert(testResultTable)
      .values(data)
      .returning();

    return testResult;
  }

  async findTestResultByPatientId(id: string) {
    const [testResult] = await this.DbProvider.select()
      .from(testResultTable)
      .where(eq(testResultTable.id, id))
      .leftJoin(
        consultantTable,
        eq(patientTable.userId, testResultTable.patientId),
      )
      .leftJoin(labTable, eq(labTable.id, testResultTable.labId));

    return testResult;
  }
  async findTestResultsByPatientId(patientId: string) {
    const testResult = await this.DbProvider.select({
      title:testResultTable.title, 
      date: testResultTable.createdAt, 
      doctor: userTable.fullName, 
      lab: labTable.name, 
      testValues: testResultTable.testValues, 
      status: testResultTable.status, 

    })
      .from(testResultTable)
      .where(eq(testResultTable.patientId, patientId))
      .innerJoin(
        consultantTable,
        eq(consultantTable.userId, testResultTable.consultantId),
      )
      .innerJoin(userTable, eq(userTable.id, consultantTable.userId))
      .leftJoin(labTable, eq(labTable.id, testResultTable.labId));

    return testResult;
  }

  async findTestResultsByConsultant(consultantId: string) {
    const testResults = await this.DbProvider.select()
      .from(testResultTable)
      .where(eq(testResultTable.consultantId, consultantId))
      .leftJoin(labTable, eq(labTable.id, testResultTable.labId))
      .orderBy(desc(testResultTable.date));

    return testResults;
  }

  async findTestResultsByLab(labId: string) {
    const testResults = await this.DbProvider.select()
      .from(testResultTable)
      .where(eq(testResultTable.labId, labId))
      .leftJoin(
        consultantTable,
        eq(consultantTable.userId, testResultTable.consultantId),
      )
      .orderBy(desc(testResultTable.date));

    return testResults;
  }

  async updateTestResult(
    data: Partial<testResultTableInsertType>,
    id: string,
    consultantId: string,
  ) {
    const [testResult] = await this.DbProvider.update(testResultTable)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(testResultTable.id, id),
          eq(testResultTable.consultantId, consultantId),
        ),
      )
      .returning();

    return testResult;
  }

  async deleteTestResult(id: string, consultantId: string) {
    const [testResult] = await this.DbProvider.delete(testResultTable)
      .where(
        and(
          eq(testResultTable.id, id),
          eq(testResultTable.consultantId, consultantId),
        ),
      )
      .returning();

    return testResult;
  }

  async findAllTestResults() {
    const testResults = await this.DbProvider.select()
      .from(testResultTable)
      .leftJoin(
        consultantTable,
        eq(consultantTable.userId, testResultTable.consultantId),
      )
      .leftJoin(labTable, eq(labTable.id, testResultTable.labId))
      .orderBy(desc(testResultTable.date));

    return testResults;
  }
}
