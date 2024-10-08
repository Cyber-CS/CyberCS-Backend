import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './modules/manual-search/manual-search.module';
import { MaliciousIntentModule } from './modules/malicious-intent/malicious-intent.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { ManagementModule } from './modules/management/management.module';
import { EncryptionService } from './modules/encryption/encryption.service';
import { EncryptionModule } from './modules/encryption/encryption.module';
import { VirusTotalModule } from './modules/virustotal/virustotal.module';
import { HIBPModule } from './modules/hibp/hibp.module';
import { EmpresaModule } from './modules/Empresa/empresa.module';
import { AutomaticSearchModule } from './modules/automatic-search/automatic-search.module';
import { AutomaticSearchService } from './modules/automatic-search/automatic-search.service';
import { HttpModule } from '@nestjs/axios';
import { MaliciousIntentService } from './modules/malicious-intent/malicious-intent.service';
import { MonitorAlertsModule } from './monitor-alerts/monitor-alerts.module';

dotenv.config();
const envDB = process.env.DB_MONGO;
@Module({
  imports: [
    MongooseModule.forRoot(envDB),
    SearchModule,
    AutomaticSearchModule,
    ManagementModule,
    MaliciousIntentModule,
    EncryptionModule,
    VirusTotalModule,
    HIBPModule,
    EmpresaModule,
    HttpModule,
    MonitorAlertsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EncryptionService,
    AutomaticSearchService,
    MaliciousIntentService,
  ],
})
export class AppModule {}
