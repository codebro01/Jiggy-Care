import { Module } from '@nestjs/common';
import { EncryptionServiceService } from './encryption-service.service';

@Module({
  providers: [EncryptionServiceService],
  exports: [EncryptionServiceService]
})
export class EncryptionServiceModule {}
