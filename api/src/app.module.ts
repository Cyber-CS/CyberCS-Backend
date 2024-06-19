import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './modules/search/search.module';
import { MaliciousIntentModule } from './modules/malicious-intent/malicious-intent.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { ManagementModule } from './modules/management/management.module';
import { EncryptionService } from './modules/encryption/encryption.service';
import { EncryptionModule } from './modules/encryption/encryption.module';

dotenv.config();
const envDB = process.env.DB_MONGO;
@Module({
  imports: [
    SearchModule,
    MaliciousIntentModule,
    MongooseModule.forRoot(envDB),
    ManagementModule,
    EncryptionModule,
  ],
  controllers: [AppController],
  providers: [AppService, EncryptionService],
})
export class AppModule {}
