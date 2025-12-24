import { Inject, Injectable } from '@nestjs/common';
import {  specialityTable } from '@src/db/speciality';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { UpdateSpecialityDto } from '@src/speciality/dto/update-speciality.dto';
import { CreateSpecialityDto } from '@src/speciality/dto/create-speciality.dto';

@Injectable()
export class SpecialityRepository{
        constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>) { }


        async   create(data: CreateSpecialityDto, userId: string ) {
            const [speciality] = await this.DbProvider.insert(specialityTable).values({...data, userId}).returning();

            return speciality;
          }
        
          async findAll() {
            const speciality = await this.DbProvider.select({
                name: specialityTable.name, 
                price: specialityTable.price, 
                description: specialityTable.description
            }).from(specialityTable);

            return speciality;
          }
        
         async  findOne(specialityId: string) {
            const [speciality] = await this.DbProvider.select().from(specialityTable).where(eq(specialityTable.id, specialityId)).limit(1);
            return speciality;
          }
        
          async update(data: UpdateSpecialityDto, specialityId: string ) {
            const [speciality] = await this.DbProvider.update(specialityTable).set({...data}).where(eq(specialityTable.id, specialityId)).returning();

            return speciality;
          }
        
          async remove(specialityId: string) {
            return await this.DbProvider.delete(specialityTable).where(eq(specialityTable.id, specialityId))
          }
    
}