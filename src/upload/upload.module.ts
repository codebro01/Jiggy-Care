import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '@src/cloudinary/cloudinary.module';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [CloudinaryModule, DbModule],
  controllers: [UploadController],
})
export class UploadModule {}
