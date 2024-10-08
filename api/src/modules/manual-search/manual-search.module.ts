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
import { EmpresaService } from '../Empresa/empresa.service';
import { EmpresaModule } from '../Empresa/empresa.module';
import {
  SearchByCompanyHash,
  SearchByCompanyHashSchema,
} from '../../schemas/management/search-by-company-hash.schema';

@Module({
  imports: [
    HttpModule,
    MaliciousIntentModule,
    EncryptionModule,
    MongooseModule.forFeature([
      { name: ManualSearch.name, schema: SearchSchema },
      ,
      { name: SearchByCompanyHash.name, schema: SearchByCompanyHashSchema },
    ]),
    EmpresaModule,
  ],
  controllers: [SearchController],
  providers: [
    EmpresaService,
    ManualSearchService,
    MaliciousIntentService,
    EncryptionService,
  ],
})
export class SearchModule {}
