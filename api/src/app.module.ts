import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './modules/search/search.module';
import { MaliciousIntentModule } from './modules/malicious-intent/malicious-intent.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { ManagementModule } from './modules/management/management.module';

dotenv.config();
const envDB = process.env.DB_MONGO;
console.log(envDB);
@Module({
  imports: [
    SearchModule,
    MaliciousIntentModule,
    MongooseModule.forRoot(envDB),
    ManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
