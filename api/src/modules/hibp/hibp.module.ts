import { Module } from '@nestjs/common';
import { HIBPService } from './hibp.service';
import { HIBPController } from './hibp.controller';

@Module({
  providers: [HIBPService],
  controllers: [HIBPController],
})
export class HIBPModule {}
