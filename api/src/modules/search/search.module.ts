import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { HttpModule } from '@nestjs/axios';
import { MaliciousIntentModule } from 'src/modules/malicious-intent/malicious-intent.module';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Search, SearchSchema } from 'src/schemas/management/search.schema';
import { EncryptionModule } from '../encryption/encryption.module';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [
    HttpModule,
    MaliciousIntentModule,
    EncryptionModule,
    MongooseModule.forFeature([{ name: Search.name, schema: SearchSchema }]),
  ],
  controllers: [SearchController],
  providers: [SearchService, MaliciousIntentService,EncryptionService],
})
export class SearchModule {}
