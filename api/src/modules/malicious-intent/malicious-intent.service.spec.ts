import { Test, TestingModule } from '@nestjs/testing';
import { MaliciousIntentService } from './malicious-intent.service';

describe('MaliciousIntentService', () => {
  let service: MaliciousIntentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaliciousIntentService],
    }).compile();

    service = module.get<MaliciousIntentService>(MaliciousIntentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
