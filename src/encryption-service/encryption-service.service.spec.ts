import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionServiceService } from './encryption-service.service';

describe('EncryptionServiceService', () => {
  let service: EncryptionServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionServiceService],
    }).compile();

    service = module.get<EncryptionServiceService>(EncryptionServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
