import { Injectable, Inject } from '@nestjs/common';
import { labTable } from '@src/db';
import { CreateLabDto } from '@src/lab/dto/create-lab.dto';
import { UpdateLabDto } from '@src/lab/dto/update-lab.dto';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


@Injectable()
export class LabRepository {
     constructor(
        @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
      ) { }
  async create(createLabDto: CreateLabDto, userId: string) {
    const [lab] = await this.DbProvider.insert(labTable).values({...createLabDto, createdBy: userId}).returning()
    return lab;
  }

  async findAll() {
    const lab = await this.DbProvider.select({
        id: labTable.id, 
        name: labTable.name, 
        address: labTable.address, 
        phone: labTable.phone, 

    }).from(labTable);

    return lab;
  }

  async findOne(labId: string) {
       const lab = await this.DbProvider.select({
         id: labTable.id,
         name: labTable.name,
         address: labTable.address,
         phone: labTable.phone,
       }).from(labTable).where(eq(labTable.id, labId));

       return lab;
  }

  async update(updateLabDto: UpdateLabDto, labId: string) {
    const [lab] = await this.DbProvider.update(labTable).set(updateLabDto).where(eq(labTable.id, labId)).returning();
    return lab;
  }


  async remove(labId: string) {
    const [lab] = await this.DbProvider.delete(labTable).where(eq(labTable.id, labId)).returning();
    return lab;
  }
}
