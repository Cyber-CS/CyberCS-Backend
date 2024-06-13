import { Module } from '@nestjs/common';
import { MaliciousIntentService } from './malicious-intent.service';

@Module({
  providers: [MaliciousIntentService]
})
export class MaliciousIntentModule {}
