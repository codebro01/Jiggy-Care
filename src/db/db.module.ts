// src/db/db.module.ts
import { Global, Module } from '@nestjs/common';
import { DbProvider } from '@src/db/provider';


@Global()
@Module({
  providers: [DbProvider],
  exports: [DbProvider],
})
export class DbModule {}
