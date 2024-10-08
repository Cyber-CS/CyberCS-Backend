import { Module } from '@nestjs/common';
import { MonitorAlertsService } from './monitor-alerts.service';
import { MonitorAlertsController } from './monitor-alerts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MonitorAlerts,
  MonitorAlertsSchema,
} from 'src/schemas/monitor-alerts/monitor-alerts.schema';
import { AutomaticSearchService } from 'src/modules/automatic-search/automatic-search.service';
import { AutomaticSearchModule } from 'src/modules/automatic-search/automatic-search.module';
import { MaliciousIntentModule } from 'src/modules/malicious-intent/malicious-intent.module';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    EncryptionModule,
    AutomaticSearchModule,
    MongooseModule.forFeature([
      { name: MonitorAlerts.name, schema: MonitorAlertsSchema },
    ]),
    MaliciousIntentModule,
    EncryptionModule,
  ],
  providers: [
    EncryptionService,
    MonitorAlertsService,
    AutomaticSearchService,
    EncryptionService,
    MaliciousIntentService,
  ],
  controllers: [MonitorAlertsController],
})
export class MonitorAlertsModule {}
