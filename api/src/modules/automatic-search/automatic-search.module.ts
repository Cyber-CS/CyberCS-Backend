import { Module } from '@nestjs/common';
import { AutomaticSearchController } from './automatic-search.controller';
import {
  AutomaticSearch,
  AutomaticSearchSchema,
} from 'src/schemas/automatic-search/automatic-search.schema';
import { MaliciousIntentService } from '../malicious-intent/malicious-intent.service';
import { HttpModule } from '@nestjs/axios';
import { MaliciousIntentModule } from '../malicious-intent/malicious-intent.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AutomaticSearch.name, schema: AutomaticSearchSchema },
    ]),
    HttpModule,
    MaliciousIntentModule,
    EncryptionModule,
  ],
  controllers: [AutomaticSearchController],
  providers: [AutomaticSearch, MaliciousIntentService, EncryptionService],
  exports: [MongooseModule],
})
export class AutomaticSearchModule {}
