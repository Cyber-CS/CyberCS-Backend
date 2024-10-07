import { Module } from '@nestjs/common';
import { SearchController } from './manual-search.controller';
import { ManualSearchService } from './manual-search.service';
import { HttpModule } from '@nestjs/axios';
import { MaliciousIntentModule } from 'src/modules/malicious-intent/malicious-intent.module';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ManualSearch,
  SearchSchema,
} from 'src/schemas/management/manual-search.schema';
import { EncryptionModule } from '../encryption/encryption.module';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [
    HttpModule,
    MaliciousIntentModule,
    EncryptionModule,
    MongooseModule.forFeature([
      { name: ManualSearch.name, schema: SearchSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [ManualSearchService, MaliciousIntentService, EncryptionService],
})
export class SearchModule {}
